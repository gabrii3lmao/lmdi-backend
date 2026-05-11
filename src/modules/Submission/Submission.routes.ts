import { Router } from "express";
import { upload } from "../../config/multer.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { validate } from "../../middlewares/validationMiddleware.js";
import { SubmissionController } from "./Submission.controller.js";
import { SubmissionService } from "./Submission.service.js";
import { SubmissionRepository } from "./Submission.repository.js";
import { ExamRepository } from "../Exams/Exam.repository.js";
import {
  createSubmissionSchema,
  submissionIdParamsSchema,
  classIdParamsSchema,
  examIdQuerySchema,
} from "./dto/submission.dto.js";

const submissionRouter = Router();
const examRepo = new ExamRepository();
const submissionRepo = new SubmissionRepository();
const submissionService = new SubmissionService(examRepo, submissionRepo);
const submissionController = new SubmissionController(submissionService);

submissionRouter.use(authMiddleware);

submissionRouter.post(
  "/",
  upload.array("files"),
  validate(createSubmissionSchema),
  submissionController.createSubmission,
);

submissionRouter.get(
  "/",
  validate(examIdQuerySchema, "query"),
  submissionController.getAllSubmissions,
);

submissionRouter.get(
  "/class/:classId",
  validate(classIdParamsSchema, "params"),
  submissionController.getSubmissionsByClass,
);

submissionRouter.get(
  "/:submissionId/answers",
  validate(submissionIdParamsSchema, "params"),
  submissionController.getSubmissionAnswers,
);

export default submissionRouter;
