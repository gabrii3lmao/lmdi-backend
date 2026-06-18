import { UserRepository } from "./User.repository.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { ExamRepository } from "../Exams/Exam.repository.js";

export class DeleteUserDataService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _classRepository: ClassRepository,
    private readonly _submissionRepository: SubmissionRepository,
    private readonly _examRepository: ExamRepository,
  ) {}

  execute = async (userId: string) => {
    await Promise.all([
      this._classRepository.deleteManyByUserId(userId),
      this._submissionRepository.deleteManyByUserId(userId),
      this._examRepository.deleteManyByUserId(userId),
    ]);

    await this._userRepository.deleteById(userId);
  };
}
