import { HttpException } from "../../config/errorHandler.js";
import { generateUploadSignature } from "../../config/multer.js";
export class SubmissionController {
    _submissionService;
    constructor(_submissionService) {
        this._submissionService = _submissionService;
    }
    getUploadSignature = async (_req, res, next) => {
        try {
            const signature = generateUploadSignature();
            return res.status(200).json(signature);
        }
        catch (error) {
            next(error);
        }
    };
    createSubmission = async (req, res, next) => {
        try {
            const teacherId = req.user?.id;
            if (!teacherId) {
                throw new HttpException("Não autenticado", 401);
            }
            const { examId, submissions } = req.body;
            if (!submissions?.length) {
                throw new HttpException("Nenhuma imagem enviada", 400);
            }
            const results = await this._submissionService.processSubmissions(examId, teacherId, submissions);
            return res.status(200).json(results);
        }
        catch (error) {
            next(error);
        }
    };
    getAllSubmissions = async (req, res, next) => {
        try {
            const { examId } = req.query;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const submissions = await this._submissionService.getSubmissionsByExamPaginated(examId, page, limit);
            return res.status(200).json(submissions);
        }
        catch (error) {
            next(error);
        }
    };
    getSubmissionsByClass = async (req, res, next) => {
        try {
            const { classId } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const submissions = await this._submissionService.getSubmissionsByClassPaginated(classId, page, limit);
            return res.status(200).json(submissions);
        }
        catch (error) {
            next(error);
        }
    };
    getSubmissionAnswers = async (req, res, next) => {
        try {
            const { submissionId } = req.params;
            const answers = await this._submissionService.getSubmissionAnswers(submissionId);
            if (!answers) {
                throw new HttpException("Submissão não encontrada", 404);
            }
            return res.status(200).json({
                answers,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=Submission.controller.js.map