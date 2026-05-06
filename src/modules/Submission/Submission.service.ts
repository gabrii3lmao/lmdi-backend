import type { ExamRepository } from "../Exams/Exam.repository.js";
import type { SubmissionRepository } from "./Submission.repository.js";
import { submissionQueue } from "./Submission.queue.js";
import { gradeExam } from "./Grade.service.js";

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
      throw new Error("EXAM_NOT_FOUND");
    }

    const processedFilePaths = files.map((f) => {
      return f.path.replace("/upload/", "/upload/e_grayscale,e_contrast:100/");
    });

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
        examId: examId,
        imageUrl: filePaths[index], // A URL da imagem a ser lida
        answerKey: exam.answerKey,
        questionsCount: exam.questionsCount,
      },
      opts: {
        attempts: 3, // tenta 3 vezes (aumentar depois)
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

  async getSubmissionsByExam(examId: string) {
    return await this._submissionRepo.findByExamId(examId);
  }

  async getSubmissionaAnswers(submissionId: string) {
    return await this._submissionRepo.getSubmissionsAnswersById(submissionId);
  }
}
