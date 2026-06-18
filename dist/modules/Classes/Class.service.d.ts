import { ClassRepository } from "./Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { type IClass } from "./classModel.js";
import type { PaginatedResponse } from "../common/dto/pagination.dto.js";
export declare class ClassService {
    private readonly _classRepository;
    private readonly _submissionRepo;
    constructor(_classRepository: ClassRepository, _submissionRepo: SubmissionRepository);
    createClass(classData: Partial<IClass>): Promise<IClass>;
    findAllByTeacher(teacherId: string, page: number, limit: number): Promise<PaginatedResponse<IClass>>;
    findById(id: string): Promise<IClass | null>;
    updateClass(classId: string, classData: Partial<IClass>, teacherId: string): Promise<IClass | null>;
    deleteClass(classId: string, teacherId: string): Promise<string[]>;
}
//# sourceMappingURL=Class.service.d.ts.map