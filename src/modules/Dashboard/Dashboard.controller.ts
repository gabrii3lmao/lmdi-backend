import type { Request, Response, NextFunction } from "express";
import type { DashboardService } from "./Dashboard.service.js";
import { HttpException } from "../../config/errorHandler.js";

interface AuthRequest extends Request {
  user?: { id: string };
}

export class DashboardController {
  constructor(private readonly _dashboardService: DashboardService) {}

  getDashboard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const teacherId = req.user?.id;

      if (!teacherId) {
        throw new HttpException("Não autenticado", 401);
      }

      const dashboard = await this._dashboardService.getDashboard(teacherId);

      return res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  };
}
