import type { ExamRepository } from "../Exams/Exam.repository.js";
import type { SubmissionRepository } from "./Submission.repository.js";
import type { ISubmission } from "./Submission.model.js";
import type { PaginatedResponse } from "../common/dto/pagination.dto.js";
export declare class SubmissionService {
    private readonly _examRepo;
    private readonly _submissionRepo;
    constructor(_examRepo: ExamRepository, _submissionRepo: SubmissionRepository);
    processSubmissions(examId: string, teacherId: string, files: Express.Multer.File[]): Promise<any[]>;
    getSubmissionsByClass(classId: string): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getSubmissionsByClassPaginated(classId: string, page: number, limit: number): Promise<PaginatedResponse<ISubmission>>;
    getSubmissionsByExam(examId: string): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getSubmissionsByExamPaginated(examId: string, page: number, limit: number): Promise<PaginatedResponse<ISubmission>>;
    getSubmissionAnswers(submissionId: string): Promise<(string | null)[] | null>;
    updateSubmission(submissionId: string, updateData: Partial<ISubmission>): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
//# sourceMappingURL=Submission.service.d.ts.map