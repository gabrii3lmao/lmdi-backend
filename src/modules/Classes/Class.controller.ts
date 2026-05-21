import type { NextFunction, Request, Response } from "express";
import { ClassService } from "./Class.service.js";
import { type ClassValidationType } from "./dto/create-class.js";
import { HttpException } from "../../config/errorHandler.js";

interface AuthRequest extends Request {
  user?: { id: string };
}

export class ClassController {
  constructor(private readonly _classService: ClassService) {}

  createClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) throw new HttpException("Usuário não autenticado", 401);

      const classData = req.body as ClassValidationType;

      const newClass = await this._classService.createClass({
        ...classData,
        teacherId,
      });

      return res
        .status(201)
        .json({ message: "Turma criada com sucesso", classe: newClass });
    } catch (error) {
      next(error);
    }
  };

  getClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) throw new HttpException("Usuário não autenticado", 401);

      const classes = await this._classService.findAllByTeacher(teacherId);

      return res.status(200).json(classes);
    } catch (error) {
      next(error);
    }
  };

  updateClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const teacherId = req.user?.id;

      if (!teacherId) throw new HttpException("Usuário não autenticado", 401);

      const classData = req.body as ClassValidationType;

      const updatedClass = await this._classService.updateClass(
        id as string,
        classData,
        teacherId,
      );

      return res
        .status(200)
        .json({ message: "Turma atualizada com sucesso", turma: updatedClass });
    } catch (error) {
      next(error);
    }
  };

  deleteClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const teacherId = req.user?.id;

      if (!teacherId) throw new HttpException("Usuário não autenticado", 401);

      await this._classService.deleteClass(id as string, teacherId);

      return res.status(200).json({ message: "Turma deletada com sucesso" });
    } catch (error) {
      next(error);
    }
  };
}
