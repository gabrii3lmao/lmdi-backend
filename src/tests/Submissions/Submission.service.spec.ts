import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmissionService } from "../../modules/Submission/Submission.service.js";
import type { ExamRepository } from "../../modules/Exams/Exam.repository.js";
import type { SubmissionRepository } from "../../modules/Submission/Submission.repository.js";
import { HttpException } from "../../config/errorHandler.js";

vi.mock("../../modules/Submission/Submission.queue.js", () => ({
  submissionQueue: { addBulk: vi.fn() },
}));

import { submissionQueue } from "../../modules/Submission/Submission.queue.js";

describe("SubmissionService", () => {
  let examRepoMock: Partial<ExamRepository>;
  let subRepoMock: Partial<SubmissionRepository>;
  let service: SubmissionService;

  beforeEach(() => {
    examRepoMock = {
      findByIdAndTeacher: vi.fn(),
    };
    subRepoMock = {
      create: vi.fn(),
      findByClass: vi.fn(),
      findByExamId: vi.fn(),
      findByExamIdPaginated: vi.fn(),
      findByClassPaginated: vi.fn(),
      getSubmissionsAnswersById: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
    };

    service = new SubmissionService(
      examRepoMock as ExamRepository,
      subRepoMock as SubmissionRepository,
    );
    vi.clearAllMocks();
  });

  describe("processSubmissions", () => {
    const mockSubmissions = [
      { studentName: "Maria", imageUrl: "https://res.cloudinary.com/demo/image/upload/prova.jpg" },
      { studentName: "João", imageUrl: "https://res.cloudinary.com/demo/image/upload/prova2.jpg" },
    ];

    it("deve lançar HttpException 404 se o exame não for encontrado", async () => {
      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(null);

      await expect(
        service.processSubmissions("exam-id", "teacher-id", mockSubmissions),
      ).rejects.toThrow(HttpException);

      await expect(
        service.processSubmissions("exam-id", "teacher-id", mockSubmissions),
      ).rejects.toMatchObject({ statusCode: 404, message: "Gabarito não encontrado" });
    });

    it("deve criar submissões pending e enfileirar jobs com sucesso", async () => {
      const mockExam = {
        _id: "exam-1",
        classId: "class-1",
        answerKey: ["A", "B", "C"],
        questionsCount: 3,
      };
      const mockPendingSubs = [
        { _id: "sub-1", examId: "exam-1", studentName: "Maria", status: "pending", toJSON: () => ({ _id: "sub-1" }) },
        { _id: "sub-2", examId: "exam-1", studentName: "João", status: "pending", toJSON: () => ({ _id: "sub-2" }) },
      ];

      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(mockExam as any);
      vi.mocked(subRepoMock.create!)
        .mockResolvedValueOnce(mockPendingSubs[0] as any)
        .mockResolvedValueOnce(mockPendingSubs[1] as any);

      const result = await service.processSubmissions(
        "exam-1",
        "teacher-1",
        mockSubmissions,
      );

      expect(examRepoMock.findByIdAndTeacher).toHaveBeenCalledWith("exam-1", "teacher-1");

      expect(subRepoMock.create).toHaveBeenCalledTimes(2);
      expect(subRepoMock.create).toHaveBeenNthCalledWith(1, {
        examId: "exam-1",
        classId: "class-1",
        userId: "teacher-1",
        studentName: "Maria",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/e_grayscale,e_contrast:100/prova.jpg",
        status: "pending",
      });
      expect(subRepoMock.create).toHaveBeenNthCalledWith(2, {
        examId: "exam-1",
        classId: "class-1",
        userId: "teacher-1",
        studentName: "João",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/e_grayscale,e_contrast:100/prova2.jpg",
        status: "pending",
      });

      expect(submissionQueue.addBulk).toHaveBeenCalledTimes(1);
      expect(submissionQueue.addBulk).toHaveBeenCalledWith([
        expect.objectContaining({
          name: "submission-sub-1",
          data: expect.objectContaining({
            submissionId: "sub-1",
            examId: "exam-1",
            imageUrl: "https://res.cloudinary.com/demo/image/upload/prova.jpg",
            answerKey: ["A", "B", "C"],
            questionsCount: 3,
          }),
        }),
        expect.objectContaining({
          name: "submission-sub-2",
          data: expect.objectContaining({
            submissionId: "sub-2",
            examId: "exam-1",
            imageUrl: "https://res.cloudinary.com/demo/image/upload/prova2.jpg",
          }),
        }),
      ]);

      expect(result).toHaveLength(2);
    });
  });

  describe("getSubmissionsByExam (non-paginated)", () => {
    it("deve retornar submissões por examId", async () => {
      vi.mocked(subRepoMock.findByExamId!).mockResolvedValue([{ _id: "sub-1" }] as any);

      const result = await service.getSubmissionsByExam("exam-1");

      expect(subRepoMock.findByExamId).toHaveBeenCalledWith("exam-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getSubmissionsByExamPaginated", () => {
    it("deve retornar submissões paginadas por examId", async () => {
      vi.mocked(subRepoMock.findByExamIdPaginated!).mockResolvedValue({
        data: [{ _id: "sub-1" }] as any,
        totalItems: 1,
      });

      const result = await service.getSubmissionsByExamPaginated("exam-1", 1, 10);

      expect(subRepoMock.findByExamIdPaginated).toHaveBeenCalledWith("exam-1", 1, 10);
      expect(result).toEqual({
        data: [{ _id: "sub-1" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it("deve calcular totalPages corretamente para múltiplas páginas", async () => {
      const manySubs = Array.from({ length: 25 }, (_, i) => ({ _id: `sub-${i + 1}` }));
      vi.mocked(subRepoMock.findByExamIdPaginated!).mockResolvedValue({
        data: manySubs.slice(0, 10) as any,
        totalItems: 25,
      });

      const result = await service.getSubmissionsByExamPaginated("exam-1", 2, 10);

      expect(result.totalItems).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(result.currentPage).toBe(2);
      expect(result.data).toHaveLength(10);
    });
  });

  describe("getSubmissionsByClass (non-paginated)", () => {
    it("deve retornar submissões por classId", async () => {
      vi.mocked(subRepoMock.findByClass!).mockResolvedValue([{ _id: "sub-1" }] as any);

      const result = await service.getSubmissionsByClass("class-1");

      expect(subRepoMock.findByClass).toHaveBeenCalledWith("class-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getSubmissionsByClassPaginated", () => {
    it("deve retornar submissões paginadas por classId", async () => {
      vi.mocked(subRepoMock.findByClassPaginated!).mockResolvedValue({
        data: [{ _id: "sub-1" }] as any,
        totalItems: 1,
      });

      const result = await service.getSubmissionsByClassPaginated("class-1", 1, 5);

      expect(subRepoMock.findByClassPaginated).toHaveBeenCalledWith("class-1", 1, 5);
      expect(result).toEqual({
        data: [{ _id: "sub-1" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  describe("getSubmissionAnswers", () => {
    it("deve retornar as respostas de uma submissão", async () => {
      vi.mocked(subRepoMock.getSubmissionsAnswersById!).mockResolvedValue(["A", "B", null]);

      const result = await service.getSubmissionAnswers("sub-1");

      expect(subRepoMock.getSubmissionsAnswersById).toHaveBeenCalledWith("sub-1");
      expect(result).toEqual(["A", "B", null]);
    });
  });

  describe("updateSubmission", () => {
    it("deve lançar HttpException 404 se submissão não existir", async () => {
      vi.mocked(subRepoMock.findById!).mockResolvedValue(null);

      await expect(
        service.updateSubmission("not-found", { score: 10 }),
      ).rejects.toThrow(HttpException);
    });

    it("deve atualizar a submissão com sucesso", async () => {
      const existing = { _id: "sub-1", status: "pending" };
      const updated = { _id: "sub-1", status: "success", score: 10 };

      vi.mocked(subRepoMock.findById!).mockResolvedValue(existing as any);
      vi.mocked(subRepoMock.update!).mockResolvedValue(updated as any);

      const result = await service.updateSubmission("sub-1", { status: "success", score: 10 });

      expect(subRepoMock.findById).toHaveBeenCalledWith("sub-1");
      expect(subRepoMock.update).toHaveBeenCalledWith("sub-1", { status: "success", score: 10 });
      expect(result).toEqual(updated);
    });
  });
});
