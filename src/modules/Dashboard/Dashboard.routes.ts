import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { DashboardController } from "./Dashboard.controller.js";
import { DashboardService } from "./Dashboard.service.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { ExamRepository } from "../Exams/Exam.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";

const dashboardRouter = Router();

const classRepo = new ClassRepository();
const examRepo = new ExamRepository();
const submissionRepo = new SubmissionRepository();
const dashboardService = new DashboardService(
  classRepo,
  examRepo,
  submissionRepo,
);
const dashboardController = new DashboardController(dashboardService);

dashboardRouter.get("/", authMiddleware, dashboardController.getDashboard);

export default dashboardRouter;
