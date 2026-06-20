import Exam, {} from "./Exam.model.js";
export class ExamRepository {
    async create(examData) {
        return await Exam.create(examData);
    }
    async update(examId, updateData) {
        return await Exam.findByIdAndUpdate(examId, updateData, {
            returnDocument: "after",
        });
    }
    async delete(examId) {
        await Exam.findByIdAndDelete(examId);
    }
    async findByIdAndTeacher(examId, teacherId) {
        return await Exam.findOne({
            _id: examId,
            teacherId,
        });
    }
    async findByClassId(classId) {
        return await Exam.find({ classId });
    }
    async findByClassIdPaginated(classId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, totalItems] = await Promise.all([
            Exam.find({ classId }).skip(skip).limit(limit),
            Exam.countDocuments({ classId }),
        ]);
        return { data, totalItems };
    }
    async deleteManyByUserId(userId) {
        await Exam.deleteMany({ teacherId: userId });
    }
}
//# sourceMappingURL=Exam.repository.js.map