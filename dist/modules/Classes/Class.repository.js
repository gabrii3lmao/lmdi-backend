import Class, {} from "./classModel.js";
import Submission from "../Submission/Submission.model.js";
import Exam from "../Exams/Exam.model.js";
export class ClassRepository {
    async create(classData) {
        return await Class.create(classData);
    }
    async findAllByTeacher(teacherId) {
        return await Class.find({ teacherId });
    }
    async findAllByTeacherPaginated(teacherId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, totalItems] = await Promise.all([
            Class.find({ teacherId }).skip(skip).limit(limit),
            Class.countDocuments({ teacherId }),
        ]);
        return { data, totalItems };
    }
    async findById(id) {
        return await Class.findById(id);
    }
    async update(id, classData) {
        return await Class.findByIdAndUpdate(id, classData, { returnDocument: "after" });
    }
    async delete(id) {
        return await Class.findByIdAndDelete(id);
    }
    async deleteCascade(classId) {
        await Submission.deleteMany({ classId });
        await Exam.deleteMany({ classId });
        return await Class.findByIdAndDelete(classId);
    }
    async deleteManyByUserId(userId) {
        await Class.deleteMany({ teacherId: userId });
    }
}
//# sourceMappingURL=Class.repository.js.map