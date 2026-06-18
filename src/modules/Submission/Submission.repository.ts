import Submission, { type ISubmission } from "./Submission.model.js";

export class SubmissionRepository {
  async create(submissionData: Partial<ISubmission>): Promise<ISubmission> {
    return await Submission.create(submissionData);
  }

  async updateStatusAndScore(
    submissionId: string,
    updateData: Partial<ISubmission>,
  ): Promise<ISubmission | null> {
    return await Submission.findByIdAndUpdate(submissionId, updateData, {
      returnDocument: "after",
    });
  }

  async findByExamId(examId: string) {
    return await Submission.find({ examId });
  }

  async findByExamIdPaginated(
    examId: string,
    page: number,
    limit: number,
  ): Promise<{ data: ISubmission[]; totalItems: number }> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      Submission.find({ examId }).skip(skip).limit(limit),
      Submission.countDocuments({ examId }),
    ]);
    return { data, totalItems };
  }

  async findByIdAndClassId(id: string, classId: string) {
    return await Submission.findOne({
      _id: id,
      classId: classId,
    });
  }

  async deleteManyByExamId(examId: string) {
    await Submission.deleteMany({ examId });
  }

  async findByClass(classId: string) {
    return await Submission.find({ classId });
  }

  async findByClassPaginated(
    classId: string,
    page: number,
    limit: number,
  ): Promise<{ data: ISubmission[]; totalItems: number }> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      Submission.find({ classId }).skip(skip).limit(limit),
      Submission.countDocuments({ classId }),
    ]);
    return { data, totalItems };
  }

  async getSubmissionsAnswersById(submissionId: string) {
    const doc = await Submission.findById(submissionId)
      .select("details")
      .lean();
    if (!doc) return null;
    return doc.details.map((d) => d.marked); // ["A", "B", "C"]
  }

  async findById(submissionId: string) {
    return await Submission.findById(submissionId);
  }

  async update(submissionId: string, updateData: Partial<ISubmission>) {
    return await Submission.findByIdAndUpdate(submissionId, updateData, {
      returnDocument: "after",
    });
  }

  async deleteManyByUserId(userId: string) {
    return await Submission.deleteMany({ userId });
  }
}
