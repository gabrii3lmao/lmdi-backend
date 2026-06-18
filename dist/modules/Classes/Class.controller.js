import { ClassService } from "./Class.service.js";
import {} from "./dto/create-class.js";
import { HttpException } from "../../config/errorHandler.js";
export class ClassController {
    _classService;
    constructor(_classService) {
        this._classService = _classService;
    }
    createClass = async (req, res, next) => {
        try {
            const teacherId = req.user?.id;
            if (!teacherId)
                throw new HttpException("Usuário não autenticado", 401);
            const classData = req.body;
            const newClass = await this._classService.createClass({
                ...classData,
                teacherId,
            });
            return res
                .status(201)
                .json({ message: "Turma criada com sucesso", classe: newClass });
        }
        catch (error) {
            next(error);
        }
    };
    getClasses = async (req, res, next) => {
        try {
            const teacherId = req.user?.id;
            if (!teacherId)
                throw new HttpException("Usuário não autenticado", 401);
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const classes = await this._classService.findAllByTeacher(teacherId, page, limit);
            return res.status(200).json(classes);
        }
        catch (error) {
            next(error);
        }
    };
    updateClass = async (req, res, next) => {
        try {
            const { id } = req.params;
            const teacherId = req.user?.id;
            if (!teacherId)
                throw new HttpException("Usuário não autenticado", 401);
            const classData = req.body;
            const updatedClass = await this._classService.updateClass(id, classData, teacherId);
            return res
                .status(200)
                .json({ message: "Turma atualizada com sucesso", turma: updatedClass });
        }
        catch (error) {
            next(error);
        }
    };
    deleteClass = async (req, res, next) => {
        try {
            const { id } = req.params;
            const teacherId = req.user?.id;
            if (!teacherId)
                throw new HttpException("Usuário não autenticado", 401);
            await this._classService.deleteClass(id, teacherId);
            return res.status(200).json({ message: "Turma deletada com sucesso" });
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=Class.controller.js.map