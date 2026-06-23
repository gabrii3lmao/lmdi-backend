import mongoose from "mongoose";
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

  async findByExamIdWithDetails(examId: string) {
    return await Submission.find({ examId }).lean();
  }

  async findByExamIdPaginated(
    examId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ data: ISubmission[]; totalItems: number }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { examId };
    if (status) filter.status = status;
    const [data, totalItems] = await Promise.all([
      Submission.find(filter).skip(skip).limit(limit),
      Submission.countDocuments(filter),
    ]);
    return { data, totalItems };
  }

  async findByExamIdAndStatus(examId: string, status: string) {
    return await Submission.find({ examId, status });
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

  async findManyByIds(submissionIds: string[]) {
    return await Submission.find({ _id: { $in: submissionIds } });
  }

  async update(submissionId: string, updateData: Partial<ISubmission>) {
    return await Submission.findByIdAndUpdate(submissionId, updateData, {
      returnDocument: "after",
    });
  }

  async delete(submissionId: string) {
    return await Submission.findByIdAndDelete(submissionId);
  }

  async deleteManyByUserId(userId: string) {
    return await Submission.deleteMany({ userId });
  }

  async countByTeacher(teacherId: string): Promise<number> {
    return await Submission.countDocuments({ userId: teacherId });
  }

  async countByStatus(
    teacherId: string,
  ): Promise<{ pending: number; success: number; error: number }> {
    const [pending, success, error] = await Promise.all([
      Submission.countDocuments({ userId: teacherId, status: "pending" }),
      Submission.countDocuments({ userId: teacherId, status: "success" }),
      Submission.countDocuments({ userId: teacherId, status: "error" }),
    ]);
    return { pending, success, error };
  }

  async getAverageScore(teacherId: string): Promise<number> {
    const result = await Submission.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(teacherId), status: "success" } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);
    return result[0]?.avgScore ?? 0;
  }

  async findRecentByTeacher(teacherId: string, limit: number) {
    return await Submission.find({ userId: teacherId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("examId", "title")
      .populate("classId", "name")
      .lean();
  }

  async countByClassId(classId: string): Promise<number> {
    return await Submission.countDocuments({ classId });
  }
}
