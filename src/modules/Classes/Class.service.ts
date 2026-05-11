import { ClassRepository } from "./Class.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";
import { type IClass } from "./classModel.js";
import { HttpException } from "../../config/errorHandler.js";

export class ClassService {
  constructor(
    private readonly _classRepository: ClassRepository,
    private readonly _submissionRepo: SubmissionRepository,
  ) {}

  async createClass(classData: Partial<IClass>): Promise<IClass> {
    return await this._classRepository.create(classData);
  }

  async findAllByTeacher(teacherId: string): Promise<IClass[]> {
    return await this._classRepository.findAllByTeacher(teacherId);
  }

  async findById(id: string): Promise<IClass | null> {
    return await this._classRepository.findById(id);
  }

  async updateClass(
    classId: string,
    classData: Partial<IClass>,
    teacherId: string,
  ): Promise<IClass | null> {
    const turma = await this._classRepository.findById(classId);

    if (!turma) throw new HttpException("Turma não encontrada", 404);

    if (turma.teacherId.toString() !== teacherId)
      throw new HttpException("Não autorizado.", 401);

    return await this._classRepository.update(classId, classData);
  }

  async deleteClass(classId: string, teacherId: string) {
    const turma = await this._classRepository.findById(classId);

    if (!turma) throw new HttpException("Turma não encontrada", 404);
    if (turma.teacherId.toString() !== teacherId)
      throw new HttpException("Não autorizado.", 401);


    const submissions = await this._submissionRepo.findByClass(classId);
    const paths = submissions.map((s) => s.imageUrl);

    await this._classRepository.deleteCascade(classId); // deleta os exames e alunos relacionados a turma

    return paths;
  }
}
