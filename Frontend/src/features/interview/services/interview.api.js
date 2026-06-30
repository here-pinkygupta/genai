import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export const generateInterviewReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
}) => {
    try {
        const formData = new FormData();

        formData.append("jobDescription", jobDescription);
        formData.append("selfDescription", selfDescription);

        if (resumeFile) {
            formData.append("resume", resumeFile);
        }

        const response = await api.post(
            "/interview",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    } catch (err) {
        console.log(err.response?.data || err.message);
        throw err;
    }
};

export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/interview/${interviewId}`);

        
        return response.data;
    } catch (err) {
        console.log(err.response?.data || err.message);
        throw err;
    }
};

export const getAllInterviews = async () => {
    try {
        const response = await api.get("/interview");

        return response.data;
    } catch (err) {
        console.log(err.response?.data || err.message);
        throw err;
    }
};

export const genrateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(
        `/interview/resume/pdf/${interviewReportId}`,
        null,
        {
            responseType: "blob",
        }
    );

    return response.data;
};