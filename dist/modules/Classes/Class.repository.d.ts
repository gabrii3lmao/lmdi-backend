import { type IClass } from "./classModel.js";
export declare class ClassRepository {
    create(classData: Partial<IClass>): Promise<IClass>;
    findAllByTeacher(teacherId: string): Promise<IClass[]>;
    findAllByTeacherPaginated(teacherId: string, page: number, limit: number): Promise<{
        data: IClass[];
        totalItems: number;
    }>;
    findById(id: string): Promise<IClass | null>;
    update(id: string, classData: Partial<IClass>): Promise<IClass | null>;
    delete(id: string): Promise<IClass | null>;
    deleteCascade(classId: string): Promise<IClass | null>;
}
//# sourceMappingURL=Class.repository.d.ts.map