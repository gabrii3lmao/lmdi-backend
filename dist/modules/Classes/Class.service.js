import { ClassRepository } from "./Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import {} from "./classModel.js";
import { HttpException } from "../../config/errorHandler.js";
export class ClassService {
    _classRepository;
    _submissionRepo;
    constructor(_classRepository, _submissionRepo) {
        this._classRepository = _classRepository;
        this._submissionRepo = _submissionRepo;
    }
    async createClass(classData) {
        return await this._classRepository.create(classData);
    }
    async findAllByTeacher(teacherId, page, limit) {
        const { data, totalItems } = await this._classRepository.findAllByTeacherPaginated(teacherId, page, limit);
        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }
    async findById(id) {
        return await this._classRepository.findById(id);
    }
    async updateClass(classId, classData, teacherId) {
        const turma = await this._classRepository.findById(classId);
        if (!turma)
            throw new HttpException("Turma não encontrada", 404);
        if (turma.teacherId.toString() !== teacherId)
            throw new HttpException("Não autorizado.", 401);
        return await this._classRepository.update(classId, classData);
    }
    async deleteClass(classId, teacherId) {
        const turma = await this._classRepository.findById(classId);
        if (!turma)
            throw new HttpException("Turma não encontrada", 404);
        if (turma.teacherId.toString() !== teacherId)
            throw new HttpException("Não autorizado.", 401);
        const submissions = await this._submissionRepo.findByClass(classId);
        const paths = submissions.map((s) => s.imageUrl);
        await this._classRepository.deleteCascade(classId); // deleta os exames e alunos relacionados a turma
        return paths;
    }
}
//# sourceMappingURL=Class.service.js.map