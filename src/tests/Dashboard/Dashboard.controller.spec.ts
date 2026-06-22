import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardController } from "../../modules/Dashboard/Dashboard.controller.js";
import type { DashboardService } from "../../modules/Dashboard/Dashboard.service.js";
import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../../config/errorHandler.js";

describe("DashboardController", () => {
  let mockService: Partial<DashboardService>;
  let controller: DashboardController;
  let req: Partial<
    Request & { user?: { id: string } }
  >;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  const mockDashboard = {
    stats: {
      totalClasses: 3,
      totalExams: 10,
      totalSubmissions: 25,
      submissionsByStatus: { pending: 2, success: 22, error: 1 },
      averageScore: 7.3,
    },
    recentClasses: [
      {
        _id: "class-1",
        name: "Turma A",
        examCount: 3,
        submissionCount: 8,
      },
    ],
    recentActivity: [
      {
        studentName: "João",
        examTitle: "Prova 1",
        className: "Turma A",
        score: 9.0,
        status: "success",
        createdAt: new Date().toISOString(),
      },
    ],
  } as any;

  beforeEach(() => {
    mockService = {
      getDashboard: vi.fn(),
    };
    controller = new DashboardController(
      mockService as DashboardService,
    );

    req = { user: { id: "teacher-1" } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("getDashboard", () => {
    it("deve retornar 200 com dados do dashboard quando autenticado", async () => {
      vi.mocked(mockService.getDashboard!).mockResolvedValue(mockDashboard);

      await controller.getDashboard(
        req as Request,
        res as Response,
        next as NextFunction,
      );

      expect(mockService.getDashboard).toHaveBeenCalledWith("teacher-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDashboard);
    });

    it("deve chamar next com HttpException 401 quando não autenticado", async () => {
      req.user = undefined;

      await controller.getDashboard(
        req as Request,
        res as Response,
        next as NextFunction,
      );

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Não autenticado",
        }),
      );
      expect(mockService.getDashboard).not.toHaveBeenCalled();
    });

    it("deve chamar next com erro quando o service lança exceção", async () => {
      const error = new HttpException("Erro interno", 500);
      vi.mocked(mockService.getDashboard!).mockRejectedValue(error);

      await controller.getDashboard(
        req as Request,
        res as Response,
        next as NextFunction,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
