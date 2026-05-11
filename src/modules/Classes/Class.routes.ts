import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { ClassController } from "./Class.controller.js";
import { ClassService } from "./Class.service.js";
import { ClassRepository } from "./Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { validate } from "../../middlewares/validationMiddleware.js";
import { classValidationSchema } from "./dto/create-class.js";

const submissionRepository = new SubmissionRepository();
const classRepository = new ClassRepository();
const classService = new ClassService(classRepository, submissionRepository);
const classController = new ClassController(classService);

const classRouter = Router();

classRouter.get("/", authMiddleware, classController.getClasses);
classRouter.post(
  "/",
  authMiddleware,
  validate(classValidationSchema),
  classController.createClass,
);
classRouter.put(
  "/:id",
  authMiddleware,
  validate(classValidationSchema),
  classController.updateClass,
);
classRouter.delete("/:id", authMiddleware, classController.deleteClass);

export default classRouter;
