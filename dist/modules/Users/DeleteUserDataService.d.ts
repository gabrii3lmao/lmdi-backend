import { UserRepository } from "./User.repository.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { ExamRepository } from "../Exams/Exam.repository.js";
export declare class DeleteUserDataService {
    private readonly _userRepository;
    private readonly _classRepository;
    private readonly _submissionRepository;
    private readonly _examRepository;
    constructor(_userRepository: UserRepository, _classRepository: ClassRepository, _submissionRepository: SubmissionRepository, _examRepository: ExamRepository);
    execute: (userId: string) => Promise<void>;
}
//# sourceMappingURL=DeleteUserDataService.d.ts.map