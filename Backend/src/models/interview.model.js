const mongoose = require('mongoose')

const technicalQuestionsSchema = new mongoose.Schema({
    question: { type: String, required: [true, "Technical question is required"] },
    answer:   { type: String, required: [true, "Answer is required"] },
    intention:{ type: String, required: [true, "Intention is required"] }
}, { _id: false })

const behaviourQuestionSchema = new mongoose.Schema({
    question: { type: String, required: [true, "Question is required"] },
    answer:   { type: String, required: [true, "Answer is required"] },
    intention:{ type: String, required: [true, "Intention is required"] }
}, { _id: false })

const skillGapsSchema = new mongoose.Schema({
    skill:    { type: String, required: [true, "Skill is required"] },
    severity: { type: String, enum: ["low", "medium", "high"], required: [true, "Severity is required"] }
}, { _id: false })

const prepPlanSchema = new mongoose.Schema({
    day:   { type: Number, required: [true, "Day is required"] },  // ← "day" not "days"
    focus: { type: String, required: [true, "Focus is required"] },
    tasks: [{ type: String }]
}, { _id: false })

const interviewReportSchema = new mongoose.Schema({
    title: {           // ← ADDED
        type: String,
        required: [true, "Title is required"]
    },
    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },
    selfDescription: { type: String },
    resume:          { type: String },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions:  [technicalQuestionsSchema],
    behavioralQuestions: [behaviourQuestionSchema],
    preparationPlan:     [prepPlanSchema],
    skillsGap:           [skillGapsSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { timestamps: true })

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)
module.exports = interviewReportModel;