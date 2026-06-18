import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmissionRepository } from "../../modules/Submission/Submission.repository.js";
import Submission from "../../modules/Submission/Submission.model.js";
vi.mock("../../modules/Submission/Submission.model.js", () => ({
    default: {
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        find: vi.fn(),
        findOne: vi.fn(),
        deleteMany: vi.fn(),
        findById: vi.fn(),
    },
}));
describe("SubmissionRepository", () => {
    let repository;
    beforeEach(() => {
        repository = new SubmissionRepository();
        vi.clearAllMocks();
    });
    it("deve criar uma submissão", async () => {
        const mockData = { examId: "123", studentName: "João" };
        vi.mocked(Submission.create).mockResolvedValue(mockData);
        const result = await repository.create(mockData);
        expect(Submission.create).toHaveBeenCalledWith(mockData);
        expect(result).toEqual(mockData);
    });
    it("deve atualizar status e nota com returnDocument: 'after'", async () => {
        const updateData = { score: 8, status: "success" };
        vi.mocked(Submission.findByIdAndUpdate).mockResolvedValue(updateData);
        const result = await repository.updateStatusAndScore("sub-1", updateData);
        expect(Submission.findByIdAndUpdate).toHaveBeenCalledWith("sub-1", updateData, { returnDocument: "after" });
        expect(result).toEqual(updateData);
    });
    it("deve buscar submissões por examId", async () => {
        const mockArray = [{ _id: "1" }];
        vi.mocked(Submission.find).mockResolvedValue(mockArray);
        const result = await repository.findByExamId("exam-1");
        expect(Submission.find).toHaveBeenCalledWith({ examId: "exam-1" });
        expect(result).toEqual(mockArray);
    });
    it("deve buscar as respostas (marked) de uma submissão por ID", async () => {
        const mockDetails = [
            { question: 1, marked: "A" },
            { question: 2, marked: "B" },
            { question: 3, marked: null },
        ];
        const leanMock = vi.fn().mockResolvedValue({ details: mockDetails });
        const selectMock = vi.fn().mockReturnValue({ lean: leanMock });
        vi.mocked(Submission.findById).mockReturnValue({
            select: selectMock,
        });
        const result = await repository.getSubmissionsAnswersById("sub-1");
        expect(Submission.findById).toHaveBeenCalledWith("sub-1");
        expect(selectMock).toHaveBeenCalledWith("details");
        expect(leanMock).toHaveBeenCalled();
        expect(result).toEqual(["A", "B", null]);
    });
    it("deve retornar null se submissão não for encontrada em getSubmissionsAnswersById", async () => {
        vi.mocked(Submission.findById).mockReturnValue({
            select: () => ({ lean: () => Promise.resolve(null) }),
        });
        const result = await repository.getSubmissionsAnswersById("not-found");
        expect(result).toBeNull();
    });
    it("deve buscar submissões por classId", async () => {
        vi.mocked(Submission.find).mockResolvedValue([{ _id: "1" }]);
        const result = await repository.findByClass("class-1");
        expect(Submission.find).toHaveBeenCalledWith({ classId: "class-1" });
        expect(result).toHaveLength(1);
    });
    it("deve deletar múltiplas submissões por examId", async () => {
        vi.mocked(Submission.deleteMany).mockResolvedValue({ deletedCount: 3 });
        await repository.deleteManyByExamId("exam-1");
        expect(Submission.deleteMany).toHaveBeenCalledWith({ examId: "exam-1" });
    });
});
//# sourceMappingURL=Submission.repository.spec.js.map