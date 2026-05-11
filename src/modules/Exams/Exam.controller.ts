import type { NextFunction, Request, Response } from "express";
import type { ExamService } from "./Exam.service.js";
import type { ExamValidationType } from "./dto/create-exam.js";
import { HttpException } from "../../config/errorHandler.js";

export class ExamController {
  constructor(private readonly _examService: ExamService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) {
        throw new HttpException("Não autenticado", 401);
      }

      const examData = req.body as ExamValidationType;

      const exam = await this._examService.createExam(examData, teacherId);

      return res.status(201).json({
        message: "Gabarito criado",
        exam,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) {
        throw new HttpException("Não autenticado", 401);
      }

      const { examId } = req.params;

      const examData = req.body as Partial<ExamValidationType>;

      const updatedExam = await this._examService.updateExam(
        examId as string,
        examData,
        teacherId,
      );

      return res.status(200).json({
        message: "Gabarito atualizado",
        exam: updatedExam,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) {
        throw new HttpException("Não autenticado", 401);
      }

      const { examId } = req.params;

      await this._examService.deleteCascadeByExamId(examId as string, teacherId);

      await this._examService.deleteExam(examId as string, teacherId);

      return res.status(200).json({
        message: "Gabarito deletado",
      });
    } catch (error) {
      next(error);
    }
  };

  listByClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classId } = req.params;

      const exams = await this._examService.getExamsByClass(classId as string);

      return res.status(200).json(exams);
    } catch (error) {
      next(error);
    }
  };
}
