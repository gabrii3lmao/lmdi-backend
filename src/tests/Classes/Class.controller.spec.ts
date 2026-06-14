import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClassController } from "../../modules/Classes/Class.controller.js";
import type { ClassService } from "../../modules/Classes/Class.service.js";
import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../../config/errorHandler.js";

describe("ClassController", () => {
  let mockService: Partial<ClassService>;
  let controller: ClassController;
  let req: Partial<Request & { user?: { id: string } }>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockService = {
      createClass: vi.fn(),
      findAllByTeacher: vi.fn(),
      updateClass: vi.fn(),
      deleteClass: vi.fn(),
    };
    controller = new ClassController(mockService as ClassService);

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

  describe("createClass", () => {
    it("deve criar turma e retornar 201", async () => {
      req.body = { name: "Turma A" };
      vi.mocked(mockService.createClass!).mockResolvedValue({
        _id: "class-1",
        name: "Turma A",
        teacherId: "teacher-1",
      } as any);

      await controller.createClass(req as Request, res as Response, next as NextFunction);

      expect(mockService.createClass).toHaveBeenCalledWith({
        name: "Turma A",
        teacherId: "teacher-1",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Turma criada com sucesso",
        classe: expect.objectContaining({ name: "Turma A" }),
      });
    });

    it("deve chamar next com HttpException 401 se não autenticado", async () => {
      req.user = undefined;

      await controller.createClass(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe("getClasses", () => {
    it("deve retornar lista paginada de turmas do professor", async () => {
      req.query = { page: "1", limit: "10" };
      vi.mocked(mockService.findAllByTeacher!).mockResolvedValue({
        data: [{ _id: "class-1", name: "Turma A" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      } as any);

      await controller.getClasses(req as Request, res as Response, next as NextFunction);

      expect(mockService.findAllByTeacher).toHaveBeenCalledWith("teacher-1", 1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [{ _id: "class-1", name: "Turma A" }],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it("deve chamar next se não autenticado", async () => {
      req.user = undefined;

      await controller.getClasses(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe("updateClass", () => {
    it("deve atualizar turma e retornar 200", async () => {
      req.params = { id: "class-1" };
      req.body = { name: "Turma Atualizada" };
      vi.mocked(mockService.updateClass!).mockResolvedValue({
        _id: "class-1",
        name: "Turma Atualizada",
      } as any);

      await controller.updateClass(req as Request, res as Response, next as NextFunction);

      expect(mockService.updateClass).toHaveBeenCalledWith(
        "class-1",
        { name: "Turma Atualizada" },
        "teacher-1",
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteClass", () => {
    it("deve deletar turma e retornar 200", async () => {
      req.params = { id: "class-1" };
      vi.mocked(mockService.deleteClass!).mockResolvedValue([]);

      await controller.deleteClass(req as Request, res as Response, next as NextFunction);

      expect(mockService.deleteClass).toHaveBeenCalledWith("class-1", "teacher-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Turma deletada com sucesso",
      });
    });
  });
});
