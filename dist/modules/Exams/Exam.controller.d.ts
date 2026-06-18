import type { NextFunction, Request, Response } from "express";
import type { ExamService } from "./Exam.service.js";
export declare class ExamController {
    private readonly _examService;
    constructor(_examService: ExamService);
    create: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    listByClass: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=Exam.controller.d.ts.map