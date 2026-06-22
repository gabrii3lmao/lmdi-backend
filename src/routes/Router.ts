import express from "express";

import authRouter from "../modules/Users/User.routes.js";
import examRouter from "../modules/Exams/Exam.routes.js";
import submissionRouter from "../modules/Submission/Submission.routes.js";
import classRouter from "../modules/Classes/Class.routes.js";
import dashboardRouter from "../modules/Dashboard/Dashboard.routes.js";

const router = express.Router();

// health endpoint
router.get("/ping", (req, res) => {
    res.send("PONG");
});

router.use("/auth", authRouter);
router.use("/exams", examRouter);
router.use("/submissions", submissionRouter);
router.use("/classes", classRouter);
router.use("/dashboard", dashboardRouter);

export default router;
