import { type IExam } from "./Exam.model.js";
export declare class ExamRepository {
    create(examData: Partial<IExam>): Promise<IExam>;
    update(examId: string, updateData: Partial<IExam>): Promise<IExam | null>;
    delete(examId: string): Promise<void>;
    findByIdAndTeacher(examId: string, teacherId: string): Promise<(import("mongoose").Document<unknown, {}, IExam, {}, import("mongoose").DefaultSchemaOptions> & IExam & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    findByClassId(classId: string): Promise<(import("mongoose").Document<unknown, {}, IExam, {}, import("mongoose").DefaultSchemaOptions> & IExam & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByClassIdPaginated(classId: string, page: number, limit: number): Promise<{
        data: IExam[];
        totalItems: number;
    }>;
    deleteManyByUserId(userId: string): Promise<void>;
}
//# sourceMappingURL=Exam.repository.d.ts.map