import type { NextFunction, Request, Response } from "express";
import { ClassService } from "./Class.service.js";
interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}
export declare class ClassController {
    private readonly _classService;
    constructor(_classService: ClassService);
    createClass: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getClasses: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    updateClass: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteClass: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
//# sourceMappingURL=Class.controller.d.ts.map