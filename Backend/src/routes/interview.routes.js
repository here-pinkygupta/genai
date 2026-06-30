const express = require("express");
const authUser = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const interviewController = require("../controllers/interview.controllers");

const InterviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
InterviewRouter.post(
    "/",
    authUser,
    upload.single("resume"),
    interviewController.genrateInterviewReportController
);

/**
 * @route GET /api/interview/
 * @description get all interview reports for the logged-in user.
 * @access private
 */
InterviewRouter.get(
    "/",
    authUser,
    interviewController.getAllInterviewReportsController
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */

InterviewRouter.get(
    "/:interviewId",
    authUser,
    interviewController.getInterviewReportByIdController
);




/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
InterviewRouter.post(
    "/resume/pdf/:interviewReportId",
    authUser,
    interviewController.genrateResumePdfController
)
module.exports = InterviewRouter;