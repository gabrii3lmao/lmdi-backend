import { ExamRepository } from "./Exam.repository.js";
import type { IExam } from "./Exam.model.js";
import type { ExamValidationType } from "./dto/create-exam.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { SubmissionService } from "../Submission/Submission.service.js";
import type { PaginatedResponse } from "../common/dto/pagination.dto.js";
export declare class ExamService {
    private readonly _examRepository;
    private readonly _classRepository;
    private readonly _submissionRepository;
    private readonly _submissionService;
    constructor(_examRepository: ExamRepository, _classRepository: ClassRepository, _submissionRepository: SubmissionRepository, _submissionService: SubmissionService);
    createExam(examData: ExamValidationType, teacherId: string): Promise<IExam>;
    updateExam(examId: string, updateData: Partial<ExamValidationType>, teacherId: string): Promise<IExam | null>;
    deleteExam(examId: string, teacherId: string): Promise<void>;
    getExamsByClass(classId: string, teacherId: string, page: number, limit: number): Promise<PaginatedResponse<IExam>>;
    deleteCascadeByExamId(examId: string, teacherId: string): Promise<void>;
}
//# sourceMappingURL=Exam.service.d.ts.map