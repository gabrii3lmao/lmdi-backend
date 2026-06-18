import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClassService } from "../../modules/Classes/Class.service.js";
import { HttpException } from "../../config/errorHandler.js";
describe("ClassService", () => {
    let classRepoMock;
    let submissionRepoMock;
    let service;
    const mockClass = {
        _id: "class-1",
        name: "Turma A",
        teacherId: "teacher-1",
    };
    beforeEach(() => {
        vi.clearAllMocks();
        classRepoMock = {
            create: vi.fn(),
            findAllByTeacher: vi.fn(),
            findAllByTeacherPaginated: vi.fn(),
            findById: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            deleteCascade: vi.fn(),
        };
        submissionRepoMock = {
            findByClass: vi.fn(),
        };
        service = new ClassService(classRepoMock, submissionRepoMock);
    });
    describe("createClass", () => {
        it("deve criar turma com sucesso", async () => {
            vi.mocked(classRepoMock.create).mockResolvedValue(mockClass);
            const result = await service.createClass({ name: "Turma A", teacherId: "teacher-1" });
            expect(classRepoMock.create).toHaveBeenCalledWith({
                name: "Turma A",
                teacherId: "teacher-1",
            });
            expect(result).toEqual(mockClass);
        });
    });
    describe("findAllByTeacher", () => {
        it("deve retornar turmas paginadas de um professor", async () => {
            vi.mocked(classRepoMock.findAllByTeacherPaginated).mockResolvedValue({
                data: [mockClass],
                totalItems: 1,
            });
            const result = await service.findAllByTeacher("teacher-1", 1, 10);
            expect(classRepoMock.findAllByTeacherPaginated).toHaveBeenCalledWith("teacher-1", 1, 10);
            expect(result).toEqual({
                data: [mockClass],
                totalItems: 1,
                totalPages: 1,
                currentPage: 1,
            });
        });
        it("deve calcular totalPages corretamente", async () => {
            const manyClasses = Array.from({ length: 25 }, (_, i) => ({
                _id: `class-${i + 1}`,
                name: `Turma ${i + 1}`,
                teacherId: "teacher-1",
            }));
            vi.mocked(classRepoMock.findAllByTeacherPaginated).mockResolvedValue({
                data: manyClasses.slice(0, 10),
                totalItems: 25,
            });
            const result = await service.findAllByTeacher("teacher-1", 1, 10);
            expect(result.totalItems).toBe(25);
            expect(result.totalPages).toBe(3);
            expect(result.data).toHaveLength(10);
        });
    });
    describe("findById", () => {
        it("deve retornar turma por ID", async () => {
            vi.mocked(classRepoMock.findById).mockResolvedValue(mockClass);
            const result = await service.findById("class-1");
            expect(classRepoMock.findById).toHaveBeenCalledWith("class-1");
            expect(result).toEqual(mockClass);
        });
    });
    describe("updateClass", () => {
        const updateData = { name: "Turma A Atualizada" };
        it("deve atualizar turma com sucesso", async () => {
            vi.mocked(classRepoMock.findById).mockResolvedValue(mockClass);
            vi.mocked(classRepoMock.update).mockResolvedValue({
                ...mockClass,
                ...updateData,
            });
            const result = await service.updateClass("class-1", updateData, "teacher-1");
            expect(classRepoMock.findById).toHaveBeenCalledWith("class-1");
            expect(classRepoMock.update).toHaveBeenCalledWith("class-1", updateData);
            expect(result?.name).toBe("Turma A Atualizada");
        });
        it("deve lançar HttpException 404 se turma não existir", async () => {
            vi.mocked(classRepoMock.findById).mockResolvedValue(null);
            await expect(service.updateClass("not-found", updateData, "teacher-1")).rejects.toMatchObject({ statusCode: 404 });
        });
        it("deve lançar HttpException 401 se não for o professor da turma", async () => {
            const otherClass = { ...mockClass, teacherId: "other-teacher" };
            vi.mocked(classRepoMock.findById).mockResolvedValue(otherClass);
            await expect(service.updateClass("class-1", updateData, "teacher-1")).rejects.toMatchObject({ statusCode: 401 });
        });
    });
    describe("deleteClass", () => {
        it("deve deletar turma com sucesso e retornar paths de imagens", async () => {
            vi.mocked(classRepoMock.findById).mockResolvedValue(mockClass);
            vi.mocked(submissionRepoMock.findByClass).mockResolvedValue([
                { imageUrl: "http://cloudinary.com/img1.jpg" },
                { imageUrl: "http://cloudinary.com/img2.jpg" },
            ]);
            vi.mocked(classRepoMock.deleteCascade).mockResolvedValue(undefined);
            const result = await service.deleteClass("class-1", "teacher-1");
            expect(classRepoMock.deleteCascade).toHaveBeenCalledWith("class-1");
            expect(result).toEqual([
                "http://cloudinary.com/img1.jpg",
                "http://cloudinary.com/img2.jpg",
            ]);
        });
        it("deve lançar HttpException 404 se turma não existir", async () => {
            vi.mocked(classRepoMock.findById).mockResolvedValue(null);
            await expect(service.deleteClass("not-found", "teacher-1")).rejects.toMatchObject({ statusCode: 404 });
        });
        it("deve lançar HttpException 401 se não for o professor", async () => {
            const otherClass = { ...mockClass, teacherId: "other-teacher" };
            vi.mocked(classRepoMock.findById).mockResolvedValue(otherClass);
            await expect(service.deleteClass("class-1", "teacher-1")).rejects.toMatchObject({ statusCode: 401 });
        });
    });
});
//# sourceMappingURL=Class.service.spec.js.map