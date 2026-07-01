const { GoogleGenAI } = require("@google/genai");
const htmlPdf = require("html-pdf-node");

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

    const parsed = JSON.parse(response.text);
    return parsed;
}

// ── PDF generation using html-pdf-node (no Chrome needed) ────────────────────
async function genratePdfFromHtml(htmlContent) {
    const file = { content: htmlContent };
    const options = {
        format: "A4",
        printBackground: true,
        margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
    };

    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    return pdfBuffer;
}

async function genrateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = {
        type: "object",
        properties: {
            html: {
                type: "string",
                description: "The HTML content of the resume which can be converted to PDF"
            }
        },
        required: ["html"]
    };

    const prompt = `Generate a resume for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

The response should be a JSON object with a single field "html" containing complete, self-contained HTML for the resume.

Rules:
- Include all CSS inline in a <style> tag inside the HTML
- Use a clean, professional design with subtle colors
- ATS-friendly: use standard section headings (Experience, Education, Skills, Projects)
- Tailored to the job description — highlight relevant skills and experience
- Max 2 pages when converted to PDF
- Do NOT use external fonts or CDN links — use system fonts only (Arial, Georgia, sans-serif)
- Do not make it sound AI-generated
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema,
        }
    });

    const parsed = JSON.parse(response.text);
    const pdfBuffer = await genratePdfFromHtml(parsed.html);
    return pdfBuffer;
}

module.exports = { genrateInterviewReport, genrateResumePdf };