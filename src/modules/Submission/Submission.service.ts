import type { ExamRepository } from "../Exams/Exam.repository.js";
import type { SubmissionRepository } from "./Submission.repository.js";
import { submissionQueue } from "./Submission.queue.js";
import { HttpException } from "../../config/errorHandler.js";
import type { ISubmission } from "./Submission.model.js";
import type { PaginatedResponse } from "../common/dto/pagination.dto.js";

export class SubmissionService {
  constructor(
    private readonly _examRepo: ExamRepository,
    private readonly _submissionRepo: SubmissionRepository,
  ) {}

  async processSubmissions(
    examId: string,
    teacherId: string,
    files: Express.Multer.File[],
  ) {
    const exam = await this._examRepo.findByIdAndTeacher(examId, teacherId);

    if (!exam) {
      throw new HttpException("Gabarito não encontrado", 404);
    }

    const processedFilePaths = files.map((f) =>
      f.path.replace("/upload/", "/upload/e_grayscale,e_contrast:100/"),
    );

    const filePaths = files.map((f) => f.path);

    const pendingSubmissions = await Promise.all(
      files.map((file, index) =>
        this._submissionRepo.create({
          examId,
          classId: exam.classId,
          studentName: file.originalname.split(".")[0],
          imageUrl: processedFilePaths[index],
          status: "pending",
        }),
      ),
    );

    const jobs = pendingSubmissions.map((submission, index) => ({
      name: `submission-${submission._id}`,
      data: {
        submissionId: submission._id.toString(),
        examId,
        imageUrl: filePaths[index],
        answerKey: exam.answerKey,
        questionsCount: exam.questionsCount,
      },
      opts: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    }));

    await submissionQueue.addBulk(jobs);

    return pendingSubmissions.map((sub) => JSON.parse(JSON.stringify(sub)));
  }

  async getSubmissionsByClass(classId: string) {
    return await this._submissionRepo.findByClass(classId);
  }

  async getSubmissionsByClassPaginated(
    classId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ISubmission>> {
    const { data, totalItems } =
      await this._submissionRepo.findByClassPaginated(classId, page, limit);
    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  async getSubmissionsByExam(examId: string) {
    return await this._submissionRepo.findByExamId(examId);
  }

  async getSubmissionsByExamPaginated(
    examId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ISubmission>> {
    const { data, totalItems } =
      await this._submissionRepo.findByExamIdPaginated(examId, page, limit);
    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  async getSubmissionAnswers(submissionId: string) {
    return await this._submissionRepo.getSubmissionsAnswersById(submissionId);
  }

  async updateSubmission(submissionId: string, updateData: Partial<ISubmission>) {
    const submission = await this._submissionRepo.findById(submissionId);

    if (!submission) {
      throw new HttpException("Submissão não encontrada", 404);
    }

    return await this._submissionRepo.update(submissionId, updateData);
  }
}
