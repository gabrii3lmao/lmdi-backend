import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmissionController } from "../../modules/Submission/Submission.controller.js";
import type { SubmissionService } from "../../modules/Submission/Submission.service.js";
import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../../config/errorHandler.js";

vi.mock("../../config/multer.js", () => ({
  generateUploadSignature: vi.fn(),
}));

import { generateUploadSignature } from "../../config/multer.js";

describe("SubmissionController", () => {
  let mockService: Partial<SubmissionService>;
  let controller: SubmissionController;
  let req: Partial<Request & { user?: { id: string } }>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockService = {
      processSubmissions: vi.fn(),
      getSubmissionsByExam: vi.fn(),
      getSubmissionsByExamPaginated: vi.fn(),
      getSubmissionsByClass: vi.fn(),
      getSubmissionsByClassPaginated: vi.fn(),
      getSubmissionAnswers: vi.fn(),
    };
    controller = new SubmissionController(mockService as SubmissionService);

    req = {
      body: {},
      params: {},
      query: {},
      user: { id: "teacher-123" },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();
  });

  describe("getUploadSignature", () => {
    it("deve retornar 200 com a assinatura de upload", async () => {
      const mockSignature = {
        signature: "signed-token",
        timestamp: 1234567890,
        cloudName: "demo",
        apiKey: "12345",
        uploadPreset: "preset",
        folder: "submissions",
      };

      vi.mocked(generateUploadSignature).mockReturnValue(mockSignature as any);

      await controller.getUploadSignature(req as Request, res as Response, next as NextFunction);

      expect(generateUploadSignature).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSignature);
    });

    it("deve chamar next com erro se gerar assinatura falhar", async () => {
      const error = new Error("Config error");
      vi.mocked(generateUploadSignature).mockImplementation(() => { throw error; });

      await controller.getUploadSignature(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createSubmission", () => {
    it("deve chamar next com HttpException 401 se não houver teacherId", async () => {
      req.user = undefined;

      await controller.createSubmission(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it("deve chamar next com HttpException 400 se não houver submissões", async () => {
      req.body = { examId: "exam-123", submissions: [] };

      await controller.createSubmission(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it("deve chamar next com HttpException 400 se submissions for undefined", async () => {
      req.body = { examId: "exam-123" };

      await controller.createSubmission(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it("deve retornar 200 com resultados em caso de sucesso", async () => {
      const submissions = [
        { studentName: "Aluno", imageUrl: "https://cloudinary.com/img.jpg" },
      ];
      req.body = { examId: "exam-123", submissions };
      const mockResult = [{ _id: "sub-1", status: "pending" }];
      vi.mocked(mockService.processSubmissions!).mockResolvedValue(mockResult as any);

      await controller.createSubmission(req as Request, res as Response, next as NextFunction);

      expect(mockService.processSubmissions).toHaveBeenCalledWith(
        "exam-123",
        "teacher-123",
        submissions,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("deve chamar next com erro se o service lançar exceção", async () => {
      req.body = {
        examId: "exam-123",
        submissions: [{ studentName: "Aluno", imageUrl: "https://cloudinary.com/img.jpg" }],
      };
      const error = new HttpException("Gabarito não encontrado", 404);
      vi.mocked(mockService.processSubmissions!).mockRejectedValue(error);

      await controller.createSubmission(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllSubmissions", () => {
    it("deve retornar 200 com submissões paginadas", async () => {
      req.query = { examId: "exam-123", page: "1", limit: "10" };
      const mockResult = {
        data: [{ _id: "sub-1" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      };
      vi.mocked(mockService.getSubmissionsByExamPaginated!).mockResolvedValue(mockResult as any);

      await controller.getAllSubmissions(req as Request, res as Response, next as NextFunction);

      expect(mockService.getSubmissionsByExamPaginated).toHaveBeenCalledWith("exam-123", 1, 10, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("deve usar defaults page=1 limit=10 se não fornecidos", async () => {
      req.query = { examId: "exam-123" };
      vi.mocked(mockService.getSubmissionsByExamPaginated!).mockResolvedValue({
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      } as any);

      await controller.getAllSubmissions(req as Request, res as Response, next as NextFunction);

      expect(mockService.getSubmissionsByExamPaginated).toHaveBeenCalledWith("exam-123", 1, 10, undefined);
    });

    it("deve chamar next com erro se o service lançar exceção", async () => {
      req.query = { examId: "exam-123" };
      const error = new Error("DB error");
      vi.mocked(mockService.getSubmissionsByExamPaginated!).mockRejectedValue(error);

      await controller.getAllSubmissions(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSubmissionsByClass", () => {
    it("deve retornar 200 com submissões paginadas da turma", async () => {
      req.params = { classId: "class-123" };
      req.query = { page: "1", limit: "10" };
      vi.mocked(mockService.getSubmissionsByClassPaginated!).mockResolvedValue({
        data: [{ _id: "sub-1" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      } as any);

      await controller.getSubmissionsByClass(req as Request, res as Response, next as NextFunction);

      expect(mockService.getSubmissionsByClassPaginated).toHaveBeenCalledWith("class-123", 1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getSubmissionAnswers", () => {
    it("deve retornar 200 com as respostas", async () => {
      req.params = { submissionId: "sub-123" };
      vi.mocked(mockService.getSubmissionAnswers!).mockResolvedValue(["A", "B", null]);

      await controller.getSubmissionAnswers(req as Request, res as Response, next as NextFunction);

      expect(mockService.getSubmissionAnswers).toHaveBeenCalledWith("sub-123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ answers: ["A", "B", null] });
    });

    it("deve chamar next com HttpException 404 se não encontrar", async () => {
      req.params = { submissionId: "not-found" };
      vi.mocked(mockService.getSubmissionAnswers!).mockResolvedValue(null);

      await controller.getSubmissionAnswers(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
});
