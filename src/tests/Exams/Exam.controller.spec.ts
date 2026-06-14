import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExamController } from "../../modules/Exams/Exam.controller.js";
import type { ExamService } from "../../modules/Exams/Exam.service.js";
import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../../config/errorHandler.js";

describe("ExamController", () => {
  let mockService: Partial<ExamService>;
  let controller: ExamController;
  let req: Partial<Request & { user?: { id: string } }>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockService = {
      createExam: vi.fn(),
      updateExam: vi.fn(),
      deleteExam: vi.fn(),
      deleteCascadeByExamId: vi.fn(),
      getExamsByClass: vi.fn(),
    };
    controller = new ExamController(mockService as ExamService);

    req = {
      body: {},
      params: {},
      user: { id: "teacher-1" },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("create", () => {
    it("deve criar exame e retornar 201", async () => {
      req.body = {
        title: "Prova 1",
        classId: "class-1",
        questionsCount: 3,
        choicesCount: 4,
        answerKey: ["A", "B", "C"],
      };
      vi.mocked(mockService.createExam!).mockResolvedValue({ _id: "exam-1" } as any);

      await controller.create(req as Request, res as Response, next as NextFunction);

      expect(mockService.createExam).toHaveBeenCalledWith(req.body, "teacher-1");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gabarito criado",
        exam: { _id: "exam-1" },
      });
    });

    it("deve chamar next com HttpException 401 se não autenticado", async () => {
      req.user = undefined;

      await controller.create(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe("update", () => {
    it("deve atualizar exame e retornar 200", async () => {
      req.params = { examId: "exam-1" };
      req.body = { title: "Atualizado" };
      vi.mocked(mockService.updateExam!).mockResolvedValue({ _id: "exam-1", title: "Atualizado" } as any);

      await controller.update(req as Request, res as Response, next as NextFunction);

      expect(mockService.updateExam).toHaveBeenCalledWith("exam-1", req.body, "teacher-1");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deve chamar next com HttpException 401 se não autenticado", async () => {
      req.user = undefined;

      await controller.update(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe("delete", () => {
    it("deve deletar exame + cascade e retornar 200", async () => {
      req.params = { examId: "exam-1" };
      vi.mocked(mockService.deleteCascadeByExamId!).mockResolvedValue(undefined);
      vi.mocked(mockService.deleteExam!).mockResolvedValue(undefined);

      await controller.delete(req as Request, res as Response, next as NextFunction);

      expect(mockService.deleteCascadeByExamId).toHaveBeenCalledWith("exam-1", "teacher-1");
      expect(mockService.deleteExam).toHaveBeenCalledWith("exam-1", "teacher-1");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deve chamar next se cascade falhar", async () => {
      req.params = { examId: "exam-1" };
      const error = new HttpException("Gabarito não encontrado", 404);
      vi.mocked(mockService.deleteCascadeByExamId!).mockRejectedValue(error);

      await controller.delete(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockService.deleteExam).not.toHaveBeenCalled();
    });
  });

  describe("listByClass", () => {
    it("deve listar exames paginados por turma e retornar 200", async () => {
      req.params = { classId: "class-1" };
      req.query = { page: "1", limit: "10" };
      vi.mocked(mockService.getExamsByClass!).mockResolvedValue({
        data: [{ _id: "exam-1" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      } as any);

      await controller.listByClass(req as Request, res as Response, next as NextFunction);

      expect(mockService.getExamsByClass).toHaveBeenCalledWith("class-1", "teacher-1", 1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [{ _id: "exam-1" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });
});
