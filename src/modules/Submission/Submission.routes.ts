import { Router } from "express";
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
  examIdParamsSchema,
  updateSubmissionSchema,
  deleteSubmissionParamsSchema,
} from "./dto/submission.dto.js";
import { paginationQuerySchema } from "../common/dto/pagination.dto.js";

const submissionRouter = Router();
const examRepo = new ExamRepository();
const submissionRepo = new SubmissionRepository();
const submissionService = new SubmissionService(examRepo, submissionRepo);
const submissionController = new SubmissionController(submissionService);

submissionRouter.use(authMiddleware);

submissionRouter.get(
  "/upload-signature",
  submissionController.getUploadSignature,
);

submissionRouter.post(
  "/",
  validate(createSubmissionSchema),
  submissionController.createSubmission,
);

submissionRouter.get(
  "/",
  validate(examIdQuerySchema, "query"),
  validate(paginationQuerySchema, "query"),
  submissionController.getAllSubmissions,
);

submissionRouter.get(
  "/class/:classId",
  validate(classIdParamsSchema, "params"),
  validate(paginationQuerySchema, "query"),
  submissionController.getSubmissionsByClass,
);

submissionRouter.get(
  "/:submissionId/answers",
  validate(submissionIdParamsSchema, "params"),
  submissionController.getSubmissionAnswers,
);

submissionRouter.get(
  "/:examId/export",
  validate(examIdParamsSchema, "params"),
  submissionController.exportReport,
);

submissionRouter.get(
  "/:examId/analytics",
  validate(examIdParamsSchema, "params"),
  submissionController.getAnalytics,
);

submissionRouter.post(
  "/:submissionId/reprocess",
  validate(submissionIdParamsSchema, "params"),
  submissionController.reprocess,
);

submissionRouter.post(
  "/:examId/batch-reprocess",
  validate(examIdParamsSchema, "params"),
  submissionController.batchReprocess,
);

submissionRouter.put(
  "/:submissionId",
  validate(submissionIdParamsSchema, "params"),
  validate(updateSubmissionSchema),
  submissionController.update,
);

submissionRouter.delete(
  "/:submissionId",
  validate(deleteSubmissionParamsSchema, "params"),
  submissionController.delete,
);

export default submissionRouter;
