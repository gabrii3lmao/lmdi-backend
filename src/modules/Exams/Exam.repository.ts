import Exam, { type IExam } from "./Exam.model.js";

export class ExamRepository {
  async create(examData: Partial<IExam>): Promise<IExam> {
    return await Exam.create(examData);
  }

  async update(
    examId: string,
    updateData: Partial<IExam>,
  ): Promise<IExam | null> {
    return await Exam.findByIdAndUpdate(examId, updateData, { returnDocument: "after" });
  }

  async delete(examId: string): Promise<void> {
    await Exam.findByIdAndDelete(examId);
  }

  async findByIdAndTeacher(examId: string, teacherId: string) {
    return await Exam.findOne({
      _id: examId,
      teacherId,
    });
  }

  async findByClassId(classId: string) {
    return await Exam.find({ classId });
  }

  async findByClassIdPaginated(
    classId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IExam[]; totalItems: number }> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      Exam.find({ classId }).skip(skip).limit(limit),
      Exam.countDocuments({ classId }),
    ]);
    return { data, totalItems };
  }
}
