import { HttpException } from "../../config/errorHandler.js";
export class ExamController {
    _examService;
    constructor(_examService) {
        this._examService = _examService;
    }
    create = async (req, res, next) => {
        try {
            const teacherId = req.user?.id;
            if (!teacherId) {
                throw new HttpException("Não autenticado", 401);
            }
            const examData = req.body;
            const exam = await this._examService.createExam(examData, teacherId);
            return res.status(201).json({
                message: "Gabarito criado",
                exam,
            });
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const teacherId = req.user?.id;
            if (!teacherId) {
                throw new HttpException("Não autenticado", 401);
            }
            const { examId } = req.params;
            const examData = req.body;
            const updatedExam = await this._examService.updateExam(examId, examData, teacherId);
            return res.status(200).json({
                message: "Gabarito atualizado",
                exam: updatedExam,
            });
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const teacherId = req.user?.id;
            if (!teacherId) {
                throw new HttpException("Não autenticado", 401);
            }
            const { examId } = req.params;
            await this._examService.deleteCascadeByExamId(examId, teacherId);
            await this._examService.deleteExam(examId, teacherId);
            return res.status(200).json({
                message: "Gabarito deletado",
            });
        }
        catch (error) {
            next(error);
        }
    };
    listByClass = async (req, res, next) => {
        try {
            const { classId } = req.params;
            const teacherId = req.user?.id;
            if (!teacherId) {
                throw new HttpException("Não autenticado", 401);
            }
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const exams = await this._examService.getExamsByClass(classId, teacherId, page, limit);
            return res.status(200).json(exams);
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=Exam.controller.js.map