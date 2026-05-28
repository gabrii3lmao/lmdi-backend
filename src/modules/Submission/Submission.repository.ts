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
}
