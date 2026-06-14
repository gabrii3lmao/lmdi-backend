import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExamService } from "../../modules/Exams/Exam.service.js";
import type { ExamRepository } from "../../modules/Exams/Exam.repository.js";
import type { ClassRepository } from "../../modules/Classes/Class.repository.js";
import type { SubmissionRepository } from "../../modules/Submission/Submission.repository.js";
import type { SubmissionService } from "../../modules/Submission/Submission.service.js";
import { HttpException } from "../../config/errorHandler.js";

vi.mock("../../modules/Submission/Grade.service.js", () => ({
  gradeExam: vi.fn(),
}));

import { gradeExam } from "../../modules/Submission/Grade.service.js";

describe("ExamService", () => {
  let examRepoMock: Partial<ExamRepository>;
  let classRepoMock: Partial<ClassRepository>;
  let submissionRepoMock: Partial<SubmissionRepository>;
  let submissionServiceMock: Partial<SubmissionService>;
  let service: ExamService;

  const mockExam = {
    _id: "exam-1",
    title: "Prova 1",
    classId: "class-1",
    questionsCount: 3,
    choicesCount: 4,
    answerKey: ["A", "B", "C"],
    teacherId: "teacher-1",
  };

  const mockClass = {
    _id: "class-1",
    name: "Turma A",
    teacherId: "teacher-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    examRepoMock = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByIdAndTeacher: vi.fn(),
      findByClassId: vi.fn(),
      findByClassIdPaginated: vi.fn(),
    };

    classRepoMock = {
      create: vi.fn(),
      findAllByTeacher: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteCascade: vi.fn(),
    };

    submissionRepoMock = {
      deleteManyByExamId: vi.fn(),
    };

    submissionServiceMock = {
      getSubmissionsByExam: vi.fn(),
      updateSubmission: vi.fn(),
    };

    service = new ExamService(
      examRepoMock as ExamRepository,
      classRepoMock as ClassRepository,
      submissionRepoMock as SubmissionRepository,
      submissionServiceMock as SubmissionService,
    );
  });

  describe("createExam", () => {
    const examData = {
      title: "Nova Prova",
      classId: "class-1",
      questionsCount: 3,
      choicesCount: 4,
      answerKey: ["A", "B", "C"],
    };

    it("deve criar exame com sucesso", async () => {
      vi.mocked(classRepoMock.findById!).mockResolvedValue(mockClass as any);
      vi.mocked(examRepoMock.create!).mockResolvedValue(mockExam as any);

      const result = await service.createExam(examData, "teacher-1");

      expect(classRepoMock.findById).toHaveBeenCalledWith("class-1");
      expect(examRepoMock.create).toHaveBeenCalledWith({
        ...examData,
        teacherId: "teacher-1",
      });
      expect(result).toEqual(mockExam);
    });

    it("deve lançar HttpException 404 se classe não existir", async () => {
      vi.mocked(classRepoMock.findById!).mockResolvedValue(null);

      await expect(
        service.createExam(examData, "teacher-1"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar HttpException 403 se não for o professor da turma", async () => {
      const otherClass = { ...mockClass, teacherId: "other-teacher" };
      vi.mocked(classRepoMock.findById!).mockResolvedValue(otherClass as any);

      await expect(
        service.createExam(examData, "teacher-1"),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("updateExam", () => {
    const updateData = {
      title: "Prova Atualizada",
      answerKey: ["A", "B", "D"],
    };

    it("deve atualizar exame com sucesso", async () => {
      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(mockExam as any);
      vi.mocked(examRepoMock.update!).mockResolvedValue({
        ...mockExam,
        ...updateData,
      } as any);
      vi.mocked(submissionServiceMock.getSubmissionsByExam!).mockResolvedValue([]);

      const result = await service.updateExam("exam-1", updateData, "teacher-1");

      expect(examRepoMock.findByIdAndTeacher).toHaveBeenCalledWith("exam-1", "teacher-1");
      expect(examRepoMock.update).toHaveBeenCalledWith("exam-1", updateData);
    });

    it("deve reavaliar submissões se answerKey for modificada", async () => {
      const mockSubmissions = [
        {
          _id: "sub-1",
          details: [
            { question: "1", marked: "A" },
            { question: "2", marked: "B" },
            { question: "3", marked: "C" },
          ],
        },
        {
          _id: "sub-2",
          details: [
            { question: "1", marked: "A" },
            { question: "2", marked: "C" },
            { question: "3", marked: "D" },
          ],
        },
      ];

      vi.mocked(examRepoMock.findByIdAndTeacher!)
        .mockResolvedValueOnce(mockExam as any)
        .mockResolvedValueOnce({ ...mockExam, ...updateData } as any);
      vi.mocked(examRepoMock.update!).mockResolvedValue({ ...mockExam, ...updateData } as any);
      vi.mocked(submissionServiceMock.getSubmissionsByExam!).mockResolvedValue(
        mockSubmissions as any,
      );
      vi.mocked(gradeExam)
        .mockReturnValueOnce({
          score: 10,
          totalCorrect: 3,
          details: [
            { question: 1, marked: "A", correct: "A", status: "correct" },
            { question: 2, marked: "B", correct: "B", status: "correct" },
            { question: 3, marked: "C", correct: "D", status: "incorrect" },
          ],
        })
        .mockReturnValueOnce({
          score: 6.67,
          totalCorrect: 2,
          details: [
            { question: 1, marked: "A", correct: "A", status: "correct" },
            { question: 2, marked: "C", correct: "B", status: "incorrect" },
            { question: 3, marked: "D", correct: "D", status: "correct" },
          ],
        });

      await service.updateExam("exam-1", updateData, "teacher-1");

      expect(submissionServiceMock.getSubmissionsByExam).toHaveBeenCalledWith("exam-1");
      expect(gradeExam).toHaveBeenCalledTimes(2);
      expect(submissionServiceMock.updateSubmission).toHaveBeenCalledTimes(2);
    });

    it("deve lançar HttpException 404 se exame não for encontrado", async () => {
      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(null);

      await expect(
        service.updateExam("not-found", updateData, "teacher-1"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("deleteExam", () => {
    it("deve deletar exame com sucesso", async () => {
      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(mockExam as any);
      vi.mocked(examRepoMock.delete!).mockResolvedValue(undefined);

      await service.deleteExam("exam-1", "teacher-1");

      expect(examRepoMock.delete).toHaveBeenCalledWith("exam-1");
    });

    it("deve lançar HttpException 404 se exame não existir", async () => {
      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(null);

      await expect(
        service.deleteExam("not-found", "teacher-1"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("getExamsByClass", () => {
    it("deve listar exames paginados de uma turma", async () => {
      vi.mocked(classRepoMock.findById!).mockResolvedValue(mockClass as any);
      vi.mocked(examRepoMock.findByClassIdPaginated!).mockResolvedValue({
        data: [mockExam] as any,
        totalItems: 1,
      });

      const result = await service.getExamsByClass("class-1", "teacher-1", 1, 10);

      expect(classRepoMock.findById).toHaveBeenCalledWith("class-1");
      expect(examRepoMock.findByClassIdPaginated).toHaveBeenCalledWith("class-1", 1, 10);
      expect(result).toEqual({
        data: [mockExam],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it("deve calcular totalPages corretamente", async () => {
      vi.mocked(classRepoMock.findById!).mockResolvedValue(mockClass as any);
      vi.mocked(examRepoMock.findByClassIdPaginated!).mockResolvedValue({
        data: [] as any,
        totalItems: 0,
      });

      const result = await service.getExamsByClass("class-1", "teacher-1", 1, 10);

      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("deve lançar HttpException 404 se turma não existir", async () => {
      vi.mocked(classRepoMock.findById!).mockResolvedValue(null);

      await expect(
        service.getExamsByClass("not-found", "teacher-1", 1, 10),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deve lançar HttpException 403 se não for o professor da turma", async () => {
      const otherClass = { ...mockClass, teacherId: "other-teacher" };
      vi.mocked(classRepoMock.findById!).mockResolvedValue(otherClass as any);

      await expect(
        service.getExamsByClass("class-1", "teacher-1", 1, 10),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("deleteCascadeByExamId", () => {
    it("deve deletar submissões em cascata", async () => {
      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(mockExam as any);
      vi.mocked(submissionRepoMock.deleteManyByExamId!).mockResolvedValue(undefined);

      await service.deleteCascadeByExamId("exam-1", "teacher-1");

      expect(submissionRepoMock.deleteManyByExamId).toHaveBeenCalledWith("exam-1");
    });

    it("deve lançar HttpException 404 se exame não existir", async () => {
      vi.mocked(examRepoMock.findByIdAndTeacher!).mockResolvedValue(null);

      await expect(
        service.deleteCascadeByExamId("not-found", "teacher-1"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
