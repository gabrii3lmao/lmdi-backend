import { ExamRepository } from "./Exam.repository.js";
import type { IExam } from "./Exam.model.js";
import type { ExamValidationType } from "./dto/create-exam.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { HttpException } from "../../config/errorHandler.js";

export class ExamService {
  constructor(
    private readonly _examRepository: ExamRepository,
    private readonly _classRepository: ClassRepository,
    private readonly _submissionRepository: SubmissionRepository,
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

    return await this._examRepository.update(examId, updateData);
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

  async getExamsByClass(classId: string): Promise<IExam[]> {
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
