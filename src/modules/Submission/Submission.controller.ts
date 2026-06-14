import type { Request, Response, NextFunction } from "express";
import type { SubmissionService } from "./Submission.service.js";
import { HttpException } from "../../config/errorHandler.js";
import type { CreateSubmissionDTO } from "./dto/submission.dto.js";

interface AuthRequest extends Request {
  user?: { id: string };
}

export class SubmissionController {
  constructor(private readonly _submissionService: SubmissionService) {}

  createSubmission = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) {
        throw new HttpException("Não autenticado", 401);
      }

      const files = req.files as Express.Multer.File[];

      if (!files?.length) {
        throw new HttpException("Nenhuma imagem enviada", 400);
      }

      const { examId } = req.body as CreateSubmissionDTO;

      const results = await this._submissionService.processSubmissions(
        examId,
        teacherId,
        files,
      );

      return res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  getAllSubmissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { examId } = req.query as {
        examId: string;
      };
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const submissions =
        await this._submissionService.getSubmissionsByExamPaginated(
          examId,
          page,
          limit,
        );

      return res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  };

  getSubmissionsByClass = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { classId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const submissions =
        await this._submissionService.getSubmissionsByClassPaginated(
          classId as string,
          page,
          limit,
        );

      return res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  };

  getSubmissionAnswers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { submissionId } = req.params;

      const answers = await this._submissionService.getSubmissionAnswers(
        submissionId as string,
      );

      if (!answers) {
        throw new HttpException("Submissão não encontrada", 404);
      }

      return res.status(200).json({
        answers,
      });
    } catch (error) {
      next(error);
    }
  };
}
