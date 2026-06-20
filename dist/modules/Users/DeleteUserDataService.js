import { UserRepository } from "./User.repository.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { ExamRepository } from "../Exams/Exam.repository.js";
export class DeleteUserDataService {
    _userRepository;
    _classRepository;
    _submissionRepository;
    _examRepository;
    constructor(_userRepository, _classRepository, _submissionRepository, _examRepository) {
        this._userRepository = _userRepository;
        this._classRepository = _classRepository;
        this._submissionRepository = _submissionRepository;
        this._examRepository = _examRepository;
    }
    execute = async (userId) => {
        await Promise.all([
            this._classRepository.deleteManyByUserId(userId),
            this._submissionRepository.deleteManyByUserId(userId),
            this._examRepository.deleteManyByUserId(userId),
        ]);
        await this._userRepository.deleteById(userId);
    };
}
//# sourceMappingURL=DeleteUserDataService.js.map