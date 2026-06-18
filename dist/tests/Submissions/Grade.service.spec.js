import { describe, it, expect } from "vitest";
import { gradeExam } from "../../modules/Submission/Grade.service.js";
describe("Grade.service", () => {
    it("deve retornar nota máxima e todos os acertos quando todas as respostas estiverem corretas", () => {
        const answerKey = ["A", "B", "C", "D"];
        const studentAnswers = { "1": "A", "2": "B", "3": "C", "4": "D" };
        const result = gradeExam(answerKey, studentAnswers, 4);
        expect(result.score).toBe(10);
        expect(result.totalCorrect).toBe(4);
        expect(result.details.every((d) => d.status === "correct")).toBe(true);
    });
    it("deve calcular a nota proporcional e identificar os erros corretamente", () => {
        const answerKey = ["A", "B", "C", "D"];
        const studentAnswers = { "1": "A", "2": "C", "3": "C" };
        const result = gradeExam(answerKey, studentAnswers, 4);
        expect(result.score).toBe(5);
        expect(result.totalCorrect).toBe(2);
        expect(result.details[1].status).toBe("incorrect");
        expect(result.details[3].marked).toBeNull();
    });
    it("deve lidar com score Infinity/NaN retornando 0", () => {
        const answerKey = [];
        const studentAnswers = {};
        const result = gradeExam(answerKey, studentAnswers, 0);
        expect(result.score).toBe(0);
        expect(result.totalCorrect).toBe(0);
    });
    it("deve marcar como incorrect quando a resposta for null (não marcada)", () => {
        const answerKey = ["A", "B"];
        const studentAnswers = { "1": "A", "2": null };
        const result = gradeExam(answerKey, studentAnswers, 2);
        expect(result.score).toBe(5);
        expect(result.totalCorrect).toBe(1);
        expect(result.details[1].status).toBe("incorrect");
        expect(result.details[1].marked).toBeNull();
    });
    it("deve usar totalQuestions como denominador quando fornecido", () => {
        const answerKey = ["A", "B", "C"];
        const studentAnswers = { "1": "A", "2": "B", "3": "C" };
        const result = gradeExam(answerKey, studentAnswers, 5);
        expect(result.score).toBe(6);
        expect(result.totalCorrect).toBe(3);
    });
    it("deve fallback para answerKey.length quando totalQuestions for 0", () => {
        const answerKey = ["A", "B"];
        const studentAnswers = { "1": "A", "2": "B" };
        const result = gradeExam(answerKey, studentAnswers, 0);
        expect(result.score).toBe(10);
        expect(result.totalCorrect).toBe(2);
    });
});
//# sourceMappingURL=Grade.service.spec.js.map