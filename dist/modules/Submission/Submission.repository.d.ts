import { type ISubmission } from "./Submission.model.js";
export declare class SubmissionRepository {
    create(submissionData: Partial<ISubmission>): Promise<ISubmission>;
    updateStatusAndScore(submissionId: string, updateData: Partial<ISubmission>): Promise<ISubmission | null>;
    findByExamId(examId: string): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByExamIdPaginated(examId: string, page: number, limit: number): Promise<{
        data: ISubmission[];
        totalItems: number;
    }>;
    findByIdAndClassId(id: string, classId: string): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    deleteManyByExamId(examId: string): Promise<void>;
    findByClass(classId: string): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByClassPaginated(classId: string, page: number, limit: number): Promise<{
        data: ISubmission[];
        totalItems: number;
    }>;
    getSubmissionsAnswersById(submissionId: string): Promise<(string | null)[] | null>;
    findById(submissionId: string): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    update(submissionId: string, updateData: Partial<ISubmission>): Promise<(import("mongoose").Document<unknown, {}, ISubmission, {}, import("mongoose").DefaultSchemaOptions> & ISubmission & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
//# sourceMappingURL=Submission.repository.d.ts.map