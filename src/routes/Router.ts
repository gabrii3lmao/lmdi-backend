import express from "express";

import authRouter from "../modules/Users/User.routes.js";
import examRouter from "../modules/Exams/Exam.routes.js";
import submissionRouter from "../modules/Submission/Submission.routes.js";
import classRouter from "../modules/Classes/Class.routes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/exams", examRouter);
router.use("/submissions", submissionRouter);
router.use("/classes", classRouter);

export default router;
