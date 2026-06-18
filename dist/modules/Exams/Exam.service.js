import { ExamRepository } from "./Exam.repository.js";
import { ClassRepository } from "../Classes/Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { HttpException } from "../../config/errorHandler.js";
import { SubmissionService } from "../Submission/Submission.service.js";
import { gradeExam } from "../Submission/Grade.service.js";
export class ExamService {
    _examRepository;
    _classRepository;
    _submissionRepository;
    _submissionService;
    constructor(_examRepository, _classRepository, _submissionRepository, _submissionService) {
        this._examRepository = _examRepository;
        this._classRepository = _classRepository;
        this._submissionRepository = _submissionRepository;
        this._submissionService = _submissionService;
    }
    async createExam(examData, teacherId) {
        const classExists = await this._classRepository.findById(examData.classId);
        if (!classExists) {
            throw new HttpException("Classe não encontrada", 404);
        }
        if (classExists.teacherId.toString() !== teacherId) {
            throw new HttpException("Não autorizado", 403);
        }
        return await this._examRepository.create({
            ...examData,
            teacherId,
        });
    }
    async updateExam(examId, updateData, teacherId) {
        const exam = await this._examRepository.findByIdAndTeacher(examId, teacherId);
        if (!exam) {
            throw new HttpException("Gabarito não encontrado", 404);
        }
        await this._examRepository.update(examId, updateData);
        if (updateData.answerKey) {
            const submissions = await this._submissionService.getSubmissionsByExam(examId);
            if (submissions.length > 0) {
                const updatePromises = submissions.map((submission) => {
                    const studentAnswers = {};
                    submission.details.forEach((detail) => {
                        studentAnswers[detail.question.toString()] = detail.marked;
                    });
                    const result = gradeExam(updateData.answerKey, studentAnswers, updateData.answerKey.length);
                    return this._submissionService.updateSubmission(submission._id, {
                        score: result.score,
                        totalCorrect: result.totalCorrect,
                        details: result.details,
                        status: "success",
                    });
                });
                await Promise.all(updatePromises);
            }
        }
        return this._examRepository.findByIdAndTeacher(examId, teacherId);
    }
    async deleteExam(examId, teacherId) {
        const exam = await this._examRepository.findByIdAndTeacher(examId, teacherId);
        if (!exam) {
            throw new HttpException("Gabarito não encontrado", 404);
        }
        await this._examRepository.delete(examId);
    }
    async getExamsByClass(classId, teacherId, page, limit) {
        const classExist = await this._classRepository.findById(classId);
        if (!classExist) {
            throw new HttpException("Classe não encontrada", 404);
        }
        if (classExist.teacherId.toString() !== teacherId) {
            throw new HttpException("Não autorizado", 403);
        }
        const { data, totalItems } = await this._examRepository.findByClassIdPaginated(classId, page, limit);
        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }
    async deleteCascadeByExamId(examId, teacherId) {
        const exam = await this._examRepository.findByIdAndTeacher(examId, teacherId);
        if (!exam) {
            throw new HttpException("Gabarito não encontrado", 404);
        }
        await this._submissionRepository.deleteManyByExamId(examId);
    }
}
//# sourceMappingURL=Exam.service.js.map