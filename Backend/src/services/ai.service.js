const { GoogleGenAI } = require("@google/genai");
const PDFDocument = require('pdfkit');

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportResponseSchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            description: "The title of the job for which the interview report is generated"
        },
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate matches the job"
        },
        technicalQuestions: {
            type: "array",
            description: "Technical questions that can be asked in the interview",
            items: {
                type: "object",
                properties: {
                    question:  { type: "string", description: "The technical question" },
                    intention: { type: "string", description: "Why the interviewer asks this" },
                    answer:    { type: "string", description: "How to answer this question" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: "array",
            description: "Behavioral questions that can be asked in the interview",
            items: {
                type: "object",
                properties: {
                    question:  { type: "string", description: "The behavioral question" },
                    intention: { type: "string", description: "Why the interviewer asks this" },
                    answer:    { type: "string", description: "How to answer this question" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillsGap: {
            type: "array",
            description: "Skills missing from the candidate's profile",
            items: {
                type: "object",
                properties: {
                    skill:    { type: "string", description: "The missing skill" },
                    severity: { type: "string", enum: ["low", "medium", "high"], description: "How critical this gap is" }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "array",
            description: "Day-wise preparation plan for the interview",
            items: {
                type: "object",
                properties: {
                    day:   { type: "number", description: "Day number e.g. 1, 2, 3" },
                    focus: { type: "string", description: "What to focus on this day" },
                    tasks: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of tasks to complete on this day"
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillsGap", "preparationPlan"]
};

async function genrateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
You are an expert interview coach. Generate a structured interview preparation report strictly based on the candidate information below.

Job Description:
${jobDescription}

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Instructions:
- Generate exactly 5 technical questions relevant to the job description and candidate's skills
- Generate exactly 3 behavioral questions
- Identify skill gaps by comparing the job requirements against the candidate's resume
- Create a 7-day preparation plan with specific daily tasks
- Give a matchScore between 0-100 based on how well the candidate fits the job
- Set title as the job title from the job description
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportResponseSchema,
        }
    });

    return JSON.parse(response.text);
}

async function genrateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumeSchema = {
        type: "object",
        properties: {
            name:           { type: "string" },
            email:          { type: "string" },
            phone:          { type: "string" },
            linkedin:       { type: "string" },
            github:         { type: "string" },
            summary:        { type: "string" },
            skills:         { type: "array", items: { type: "string" } },
            experience: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        company:      { type: "string" },
                        role:         { type: "string" },
                        duration:     { type: "string" },
                        achievements: { type: "array", items: { type: "string" } }
                    },
                    required: ["company", "role", "duration", "achievements"]
                }
            },
            education: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        institution: { type: "string" },
                        degree:      { type: "string" },
                        year:        { type: "string" }
                    },
                    required: ["institution", "degree", "year"]
                }
            },
            projects: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name:        { type: "string" },
                        description: { type: "string" },
                        tech:        { type: "string" }
                    },
                    required: ["name", "description", "tech"]
                }
            },
            certifications: { type: "array", items: { type: "string" } }
        },
        required: ["name", "email", "summary", "skills", "experience", "education", "projects"]
    };

    const prompt = `
Extract and tailor resume data for this candidate based on the job description.
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Rules:
- Tailor the summary and experience bullet points to match the job description
- Only include skills relevant to the job
- Keep achievements concise and impact-focused
- ATS friendly language
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
        }
    });

    const data = JSON.parse(response.text);
    return buildPdfWithPdfkit(data);
}

function buildPdfWithPdfkit(data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const ACCENT = '#d20d3b';
        const MUTED  = '#555555';
        const WIDTH  = doc.page.width - 100;

        // ── Header ───────────────────────────────────────────────
        doc.fontSize(22).font('Helvetica-Bold').fillColor('black')
           .text(data.name, { align: 'center' });
        doc.moveDown(0.3);

        const contacts = [data.email, data.phone, data.linkedin, data.github]
            .filter(Boolean).join('  |  ');
        doc.fontSize(9).font('Helvetica').fillColor(MUTED)
           .text(contacts, { align: 'center' });
        doc.moveDown(0.8);

        // ── Section helper ───────────────────────────────────────
        function section(title) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(ACCENT).text(title.toUpperCase());
            doc.moveDown(0.1);
            doc.moveTo(50, doc.y).lineTo(50 + WIDTH, doc.y)
               .strokeColor(ACCENT).lineWidth(0.5).stroke();
            doc.moveDown(0.4);
            doc.fillColor('black');
        }

        // ── Summary ──────────────────────────────────────────────
        section('Professional Summary');
        doc.fontSize(9.5).font('Helvetica')
           .text(data.summary, { width: WIDTH, align: 'justify' });

        // ── Skills ───────────────────────────────────────────────
        section('Skills');
        doc.fontSize(9.5).font('Helvetica')
           .text(data.skills.join('  •  '), { width: WIDTH });

        // ── Experience ───────────────────────────────────────────
        if (data.experience?.length) {
            section('Experience');
            data.experience.forEach(exp => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text(exp.role);
                doc.fontSize(9).font('Helvetica').fillColor(MUTED)
                   .text(`${exp.company}  |  ${exp.duration}`);
                doc.fillColor('black');
                exp.achievements.forEach(a => {
                    doc.fontSize(9.5).font('Helvetica')
                       .text(`• ${a}`, { indent: 10, width: WIDTH - 10 });
                });
                doc.moveDown(0.5);
            });
        }

        // ── Projects ─────────────────────────────────────────────
        if (data.projects?.length) {
            section('Projects');
            data.projects.forEach(p => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text(p.name);
                doc.fontSize(9).font('Helvetica').fillColor(MUTED).text(p.tech);
                doc.fillColor('black').fontSize(9.5)
                   .text(p.description, { indent: 10, width: WIDTH - 10 });
                doc.moveDown(0.4);
            });
        }

        // ── Education ────────────────────────────────────────────
        if (data.education?.length) {
            section('Education');
            data.education.forEach(e => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text(e.degree);
                doc.fontSize(9).font('Helvetica').fillColor(MUTED)
                   .text(`${e.institution}  |  ${e.year}`);
                doc.fillColor('black').moveDown(0.4);
            });
        }

        // ── Certifications ───────────────────────────────────────
        if (data.certifications?.length) {
            section('Certifications');
            data.certifications.forEach(c => {
                doc.fontSize(9.5).font('Helvetica').fillColor('black')
                   .text(`• ${c}`, { indent: 10 });
            });
        }

        doc.end();
    });
}

module.exports = { genrateInterviewReport, genrateResumePdf };