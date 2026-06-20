import Submission, {} from "./Submission.model.js";
export class SubmissionRepository {
    async create(submissionData) {
        return await Submission.create(submissionData);
    }
    async updateStatusAndScore(submissionId, updateData) {
        return await Submission.findByIdAndUpdate(submissionId, updateData, {
            returnDocument: "after",
        });
    }
    async findByExamId(examId) {
        return await Submission.find({ examId });
    }
    async findByExamIdPaginated(examId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, totalItems] = await Promise.all([
            Submission.find({ examId }).skip(skip).limit(limit),
            Submission.countDocuments({ examId }),
        ]);
        return { data, totalItems };
    }
    async findByIdAndClassId(id, classId) {
        return await Submission.findOne({
            _id: id,
            classId: classId,
        });
    }
    async deleteManyByExamId(examId) {
        await Submission.deleteMany({ examId });
    }
    async findByClass(classId) {
        return await Submission.find({ classId });
    }
    async findByClassPaginated(classId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, totalItems] = await Promise.all([
            Submission.find({ classId }).skip(skip).limit(limit),
            Submission.countDocuments({ classId }),
        ]);
        return { data, totalItems };
    }
    async getSubmissionsAnswersById(submissionId) {
        const doc = await Submission.findById(submissionId)
            .select("details")
            .lean();
        if (!doc)
            return null;
        return doc.details.map((d) => d.marked); // ["A", "B", "C"]
    }
    async findById(submissionId) {
        return await Submission.findById(submissionId);
    }
    async update(submissionId, updateData) {
        return await Submission.findByIdAndUpdate(submissionId, updateData, {
            returnDocument: "after",
        });
    }
    async deleteManyByUserId(userId) {
        return await Submission.deleteMany({ userId });
    }
}
//# sourceMappingURL=Submission.repository.js.map