const pdfParse = require("pdf-parse");
const { genrateInterviewReport, genrateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interview.model");

async function genrateInterviewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const resumeText = resumeContent.text;

    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const interviewReportByAi = await genrateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });
    

console.log("AI OUTPUT:", JSON.stringify(interviewReportByAi, null, 2)); // ← ADD THIS

    const interviewReport = await interviewReportModel.create({
      user: req.user._id,
      resume: resumeText,     
      selfDescription,
      jobDescription,
      ...interviewReportByAi,
    });

    res.status(201).json({
      message: "Interview Report created Successfully!",
      interviewReport,
    });
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).json({ message: err.message });
  }
}


async function getInterviewReportByIdController(req, res){

  const {interviewId} = req.params

  const interviewReport = await interviewReportModel.findOne({_id:interviewId, user:req.user._id})

  if(!interviewReport){
    return res.status(404).json({message:"Interview Report not found"})
  }

  res.status(201).json({
    message:"Interview Report fetched Successfully!",
    interviewReport
  })

}


async function getAllInterviewReportsController(req,res){

  const interviewReports = await interviewReportModel.
  find({ user: req.user._id }).sort({createdAt: -1}).select("-resume -selfDescription -jobDescription -__v -skillsGap -preparationPlan -technicalQuestions -behavioralQuestions")

  res.status(201).json({
    message:"Interview Reports Fetched Sucessfully!!",
    interviewReports
  })
}

async function genrateResumePdfController(req,res){
  const {interviewReportId} = req.params

  const interviewReport = await interviewReportModel.findById(interviewReportId)

  if(!interviewReport){
    return res.status(404).json({message:"Interview Report not found"})
  }

  const {resume,selfDescription,jobDescription} = interviewReport

  const pdfBuffer = await genrateResumePdf({
  resume,
  selfDescription,
  jobDescription
});

res.set({
  "Content-Type": "application/pdf",
  "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
});

return res.send(pdfBuffer);
 
}

module.exports = { genrateInterviewReportController
   ,getInterviewReportByIdController,
    getAllInterviewReportsController,
    genrateResumePdfController};