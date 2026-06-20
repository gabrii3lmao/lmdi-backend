import type { Request, Response, NextFunction } from "express";
import type { SubmissionService } from "./Submission.service.js";
interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}
export declare class SubmissionController {
    private readonly _submissionService;
    constructor(_submissionService: SubmissionService);
    getUploadSignature: (_req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    createSubmission: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getAllSubmissions: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getSubmissionsByClass: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getSubmissionAnswers: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
//# sourceMappingURL=Submission.controller.d.ts.map