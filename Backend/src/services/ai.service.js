const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer")


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// Plain JSON Schema — Gemini understands this natively, no zod-to-json-schema needed
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
            responseSchema: interviewReportResponseSchema,  // plain schema, no zod wrapper
        }
    });

    const parsed = JSON.parse(response.text);
    console.log("AI OUTPUT:", JSON.stringify(parsed, null, 2)); // keep this for now to verify
    return parsed;
}


async function genratePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0"
    });

    const pdf = await page.pdf({
        format: "A4",
        printBackground: true
    });

    await browser.close();

    return Buffer.from(pdf);
}
async function genrateResumePdf({resume,selfDescription,jobDescription}){
    const resumePdfSchema = {
        type: "object",
        properties: {
            html:{
                type: "string",
                description: "The HTML content of the resume which can be converted to PDF"
            }
    }
}

   const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `


    const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema,
        } 
    })

    const parsed = JSON.parse(response.text);
    const pdfBuffer = await genratePdfFromHtml(parsed.html);
    return pdfBuffer;

}
module.exports = { genrateInterviewReport,genrateResumePdf };