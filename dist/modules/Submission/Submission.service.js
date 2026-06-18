import { submissionQueue } from "./Submission.queue.js";
import { HttpException } from "../../config/errorHandler.js";
export class SubmissionService {
    _examRepo;
    _submissionRepo;
    constructor(_examRepo, _submissionRepo) {
        this._examRepo = _examRepo;
        this._submissionRepo = _submissionRepo;
    }
    async processSubmissions(examId, teacherId, files) {
        const exam = await this._examRepo.findByIdAndTeacher(examId, teacherId);
        if (!exam) {
            throw new HttpException("Gabarito não encontrado", 404);
        }
        const processedFilePaths = files.map((f) => f.path.replace("/upload/", "/upload/e_grayscale,e_contrast:100/"));
        const filePaths = files.map((f) => f.path);
        const pendingSubmissions = await Promise.all(files.map((file, index) => this._submissionRepo.create({
            examId,
            classId: exam.classId,
            studentName: file.originalname.split(".")[0],
            imageUrl: processedFilePaths[index],
            status: "pending",
        })));
        const jobs = pendingSubmissions.map((submission, index) => ({
            name: `submission-${submission._id}`,
            data: {
                submissionId: submission._id.toString(),
                examId,
                imageUrl: filePaths[index],
                answerKey: exam.answerKey,
                questionsCount: exam.questionsCount,
            },
            opts: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
            },
        }));
        await submissionQueue.addBulk(jobs);
        return pendingSubmissions.map((sub) => JSON.parse(JSON.stringify(sub)));
    }
    async getSubmissionsByClass(classId) {
        return await this._submissionRepo.findByClass(classId);
    }
    async getSubmissionsByClassPaginated(classId, page, limit) {
        const { data, totalItems } = await this._submissionRepo.findByClassPaginated(classId, page, limit);
        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }
    async getSubmissionsByExam(examId) {
        return await this._submissionRepo.findByExamId(examId);
    }
    async getSubmissionsByExamPaginated(examId, page, limit) {
        const { data, totalItems } = await this._submissionRepo.findByExamIdPaginated(examId, page, limit);
        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }
    async getSubmissionAnswers(submissionId) {
        return await this._submissionRepo.getSubmissionsAnswersById(submissionId);
    }
    async updateSubmission(submissionId, updateData) {
        const submission = await this._submissionRepo.findById(submissionId);
        if (!submission) {
            throw new HttpException("Submissão não encontrada", 404);
        }
        return await this._submissionRepo.update(submissionId, updateData);
    }
}
//# sourceMappingURL=Submission.service.js.map