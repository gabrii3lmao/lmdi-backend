import Class, { type IClass } from "./classModel.js";
import Submission from "../Submission/Submission.model.js";
import Exam from "../Exams/Exam.model.js";

export class ClassRepository {
  async create(classData: Partial<IClass>): Promise<IClass> {
    return await Class.create(classData);
  }

  async findAllByTeacher(teacherId: string): Promise<IClass[]> {
    return await Class.find({ teacherId });
  }

  async findById(id: string): Promise<IClass | null> {
    return await Class.findById(id);
  }

  async update(id: string, classData: Partial<IClass>): Promise<IClass | null> {
    return await Class.findByIdAndUpdate(id, classData, { returnDocument: "after" });
  }

  async delete(id: string): Promise<IClass | null> {
    return await Class.findByIdAndDelete(id);
  }

  async deleteCascade(classId: string): Promise<IClass | null> {
    await Submission.deleteMany({ classId });
    await Exam.deleteMany({ classId });
    return await Class.findByIdAndDelete(classId);
  }
}
