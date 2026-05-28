import { ExamRepository } from "./Exam.repository.js";
import type { IExam } from "./Exam.model.js";
import type { ExamValidationType } from "./dto/create-exam.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { HttpException } from "../../config/errorHandler.js";
import { SubmissionService } from "../Submission/Submission.service.js";
import { gradeExam } from "../Submission/Grade.service.js";

export class ExamService {
  constructor(
    private readonly _examRepository: ExamRepository,
    private readonly _classRepository: ClassRepository,
    private readonly _submissionRepository: SubmissionRepository,
    private readonly _submissionService: SubmissionService,
  ) {}

  async createExam(
    examData: ExamValidationType,
    teacherId: string,
  ): Promise<IExam> {
    const classExists = await this._classRepository.findById(examData.classId);

    if (!classExists) {
      throw new HttpException("Classe não encontrada", 404);
    }

    if (classExists.teacherId.toString() !== teacherId) {
      throw new HttpException("Não autorizado", 403);
    }

    return await this._examRepository.create({
      ...examData,
      teacherId,
    });
  }

  async updateExam(
    examId: string,
    updateData: Partial<ExamValidationType>,
    teacherId: string,
  ): Promise<IExam | null> {

    const exam = await this._examRepository.findByIdAndTeacher(
      examId,
      teacherId,
    );

    if (!exam) {
      throw new HttpException("Gabarito não encontrado", 404);
    }

    await this._examRepository.update(examId, updateData);

    if (updateData.answerKey) {
      const submissions =
        await this._submissionService.getSubmissionsByExam(examId);

      if (submissions.length > 0) {
        const updatePromises = submissions.map((submission) => {
          const studentAnswers: Record<string, string | null> = {};
          submission.details.forEach((detail) => {
            studentAnswers[detail.question.toString()] = detail.marked;
          });

          const result = gradeExam(
            updateData.answerKey!, 
            studentAnswers, 
            updateData.answerKey!.length, 
          );

          return this._submissionService.updateSubmission(submission._id as unknown as string, {
            score: result.score,
            totalCorrect: result.totalCorrect,
            details: result.details, 
            status: "success",
          });
        });

        await Promise.all(updatePromises);
      }
    }

    return this._examRepository.findByIdAndTeacher(examId, teacherId);
  }

  async deleteExam(examId: string, teacherId: string): Promise<void> {
    const exam = await this._examRepository.findByIdAndTeacher(
      examId,
      teacherId,
    );

    if (!exam) {
      throw new HttpException("Gabarito não encontrado", 404);
    }

    await this._examRepository.delete(examId);
  }

  async getExamsByClass(classId: string, teacherId: string): Promise<IExam[]> {
    const classExist = await this._classRepository.findById(classId);

    if (!classExist) {
      throw new HttpException("Classe não encontrada", 404);
    }

    if (classExist.teacherId.toString() !== teacherId) {
      console.log("Falhou aqui");
      throw new HttpException("Não autorizado", 403);
    }
    return await this._examRepository.findByClassId(classId);
  }

  async deleteCascadeByExamId(
    examId: string,
    teacherId: string,
  ): Promise<void> {
    const exam = await this._examRepository.findByIdAndTeacher(
      examId,
      teacherId,
    );

    if (!exam) {
      throw new HttpException("Gabarito não encontrado", 404);
    }

    await this._submissionRepository.deleteManyByExamId(examId);
  }
}
