import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "../../modules/Dashboard/Dashboard.service.js";
import type { ClassRepository } from "../../modules/Classes/Class.repository.js";
import type { ExamRepository } from "../../modules/Exams/Exam.repository.js";
import type { SubmissionRepository } from "../../modules/Submission/Submission.repository.js";

describe("DashboardService", () => {
  let classRepoMock: Partial<ClassRepository>;
  let examRepoMock: Partial<ExamRepository>;
  let submissionRepoMock: Partial<SubmissionRepository>;
  let service: DashboardService;

  const teacherId = "teacher-1";

  beforeEach(() => {
    vi.clearAllMocks();

    classRepoMock = {
      countByTeacher: vi.fn(),
      findRecentByTeacher: vi.fn(),
    };

    examRepoMock = {
      countByTeacher: vi.fn(),
      countByClassId: vi.fn(),
    };

    submissionRepoMock = {
      countByTeacher: vi.fn(),
      countByStatus: vi.fn(),
      getAverageScore: vi.fn(),
      findRecentByTeacher: vi.fn(),
      countByClassId: vi.fn(),
    };

    service = new DashboardService(
      classRepoMock as ClassRepository,
      examRepoMock as ExamRepository,
      submissionRepoMock as SubmissionRepository,
    );
  });

  describe("getDashboard", () => {
    it("deve retornar stats zerados quando não há dados", async () => {
      vi.mocked(classRepoMock.countByTeacher!).mockResolvedValue(0);
      vi.mocked(examRepoMock.countByTeacher!).mockResolvedValue(0);
      vi.mocked(submissionRepoMock.countByTeacher!).mockResolvedValue(0);
      vi.mocked(submissionRepoMock.countByStatus!).mockResolvedValue({
        pending: 0,
        success: 0,
        error: 0,
      });
      vi.mocked(submissionRepoMock.getAverageScore!).mockResolvedValue(0);
      vi.mocked(classRepoMock.findRecentByTeacher!).mockResolvedValue([]);
      vi.mocked(submissionRepoMock.findRecentByTeacher!).mockResolvedValue(
        [],
      );

      const result = await service.getDashboard(teacherId);

      expect(result.stats).toEqual({
        totalClasses: 0,
        totalExams: 0,
        totalSubmissions: 0,
        submissionsByStatus: { pending: 0, success: 0, error: 0 },
        averageScore: 0,
      });
      expect(result.recentClasses).toEqual([]);
      expect(result.recentActivity).toEqual([]);
    });

    it("deve retornar stats agregados corretamente", async () => {
      vi.mocked(classRepoMock.countByTeacher!).mockResolvedValue(3);
      vi.mocked(examRepoMock.countByTeacher!).mockResolvedValue(10);
      vi.mocked(submissionRepoMock.countByTeacher!).mockResolvedValue(25);
      vi.mocked(submissionRepoMock.countByStatus!).mockResolvedValue({
        pending: 2,
        success: 22,
        error: 1,
      });
      vi.mocked(submissionRepoMock.getAverageScore!).mockResolvedValue(7.3);
      vi.mocked(classRepoMock.findRecentByTeacher!).mockResolvedValue([]);
      vi.mocked(submissionRepoMock.findRecentByTeacher!).mockResolvedValue(
        [],
      );

      const result = await service.getDashboard(teacherId);

      expect(result.stats).toEqual({
        totalClasses: 3,
        totalExams: 10,
        totalSubmissions: 25,
        submissionsByStatus: { pending: 2, success: 22, error: 1 },
        averageScore: 7.3,
      });
    });

    it("deve retornar turmas recentes com contagens", async () => {
      const mockClasses = [
        { _id: "class-1", name: "Turma A", teacherId },
        { _id: "class-2", name: "Turma B", teacherId },
      ] as any;

      vi.mocked(classRepoMock.countByTeacher!).mockResolvedValue(2);
      vi.mocked(examRepoMock.countByTeacher!).mockResolvedValue(5);
      vi.mocked(submissionRepoMock.countByTeacher!).mockResolvedValue(12);
      vi.mocked(submissionRepoMock.countByStatus!).mockResolvedValue({
        pending: 0,
        success: 12,
        error: 0,
      });
      vi.mocked(submissionRepoMock.getAverageScore!).mockResolvedValue(8.0);
      vi.mocked(classRepoMock.findRecentByTeacher!).mockResolvedValue(
        mockClasses,
      );
      vi.mocked(examRepoMock.countByClassId!).mockResolvedValueOnce(3);
      vi.mocked(examRepoMock.countByClassId!).mockResolvedValueOnce(2);
      vi.mocked(submissionRepoMock.countByClassId!).mockResolvedValueOnce(8);
      vi.mocked(submissionRepoMock.countByClassId!).mockResolvedValueOnce(4);
      vi.mocked(submissionRepoMock.findRecentByTeacher!).mockResolvedValue(
        [],
      );

      const result = await service.getDashboard(teacherId);

      expect(result.recentClasses).toHaveLength(2);
      expect(result.recentClasses[0]).toMatchObject({
        _id: "class-1",
        name: "Turma A",
        examCount: 3,
        submissionCount: 8,
      });
      expect(result.recentClasses[1]).toMatchObject({
        _id: "class-2",
        name: "Turma B",
        examCount: 2,
        submissionCount: 4,
      });
    });

    it("deve retornar atividade recente com dados populados", async () => {
      const mockActivity = [
        {
          studentName: "João",
          score: 9.0,
          status: "success",
          createdAt: new Date("2026-06-22T10:00:00Z"),
          examId: { _id: "exam-1", title: "Prova 1" },
          classId: { _id: "class-1", name: "Turma A" },
        },
        {
          studentName: "Maria",
          score: null,
          status: "pending",
          createdAt: new Date("2026-06-22T11:00:00Z"),
          examId: { _id: "exam-2", title: "Prova 2" },
          classId: { _id: "class-2", name: "Turma B" },
        },
      ] as any;

      vi.mocked(classRepoMock.countByTeacher!).mockResolvedValue(2);
      vi.mocked(examRepoMock.countByTeacher!).mockResolvedValue(2);
      vi.mocked(submissionRepoMock.countByTeacher!).mockResolvedValue(2);
      vi.mocked(submissionRepoMock.countByStatus!).mockResolvedValue({
        pending: 1,
        success: 1,
        error: 0,
      });
      vi.mocked(submissionRepoMock.getAverageScore!).mockResolvedValue(9.0);
      vi.mocked(classRepoMock.findRecentByTeacher!).mockResolvedValue([]);
      vi.mocked(submissionRepoMock.findRecentByTeacher!).mockResolvedValue(
        mockActivity,
      );

      const result = await service.getDashboard(teacherId);

      expect(result.recentActivity).toHaveLength(2);
      expect(result.recentActivity[0]).toEqual({
        studentName: "João",
        examTitle: "Prova 1",
        className: "Turma A",
        score: 9.0,
        status: "success",
        createdAt: mockActivity[0].createdAt,
      });
      expect(result.recentActivity[1]).toEqual({
        studentName: "Maria",
        examTitle: "Prova 2",
        className: "Turma B",
        score: null,
        status: "pending",
        createdAt: mockActivity[1].createdAt,
      });
    });

    it("deve usar fallback 'Desconhecido/a' quando populate retorna nulo", async () => {
      const mockActivity = [
        {
          studentName: "João",
          score: 7.0,
          status: "success",
          createdAt: new Date(),
          examId: null,
          classId: null,
        },
      ] as any;

      vi.mocked(classRepoMock.countByTeacher!).mockResolvedValue(1);
      vi.mocked(examRepoMock.countByTeacher!).mockResolvedValue(1);
      vi.mocked(submissionRepoMock.countByTeacher!).mockResolvedValue(1);
      vi.mocked(submissionRepoMock.countByStatus!).mockResolvedValue({
        pending: 0,
        success: 1,
        error: 0,
      });
      vi.mocked(submissionRepoMock.getAverageScore!).mockResolvedValue(7.0);
      vi.mocked(classRepoMock.findRecentByTeacher!).mockResolvedValue([]);
      vi.mocked(submissionRepoMock.findRecentByTeacher!).mockResolvedValue(
        mockActivity,
      );

      const result = await service.getDashboard(teacherId);

      expect(result.recentActivity[0]).toMatchObject({
        examTitle: "Desconhecido",
        className: "Desconhecida",
      });
    });

    it("deve arredondar averageScore para 1 casa decimal", async () => {
      vi.mocked(classRepoMock.countByTeacher!).mockResolvedValue(0);
      vi.mocked(examRepoMock.countByTeacher!).mockResolvedValue(0);
      vi.mocked(submissionRepoMock.countByTeacher!).mockResolvedValue(0);
      vi.mocked(submissionRepoMock.countByStatus!).mockResolvedValue({
        pending: 0,
        success: 0,
        error: 0,
      });
      vi.mocked(submissionRepoMock.getAverageScore!).mockResolvedValue(
        7.55555,
      );
      vi.mocked(classRepoMock.findRecentByTeacher!).mockResolvedValue([]);
      vi.mocked(submissionRepoMock.findRecentByTeacher!).mockResolvedValue(
        [],
      );

      const result = await service.getDashboard(teacherId);

      expect(result.stats.averageScore).toBe(7.6);
    });
  });
});
