import { z } from "zod";
export const examValidationSchema = z.object({
    title: z
        .string({ error: "O título é obrigatório" })
        .trim()
        .min(3, "O título deve ter pelo menos 3 caracteres"),
    classId: z
        .string({ error: "O ID da turma é obrigatório" })
        .regex(/^[0-9a-fA-F]{24}$/, "ID da turma inválido"),
    questionsCount: z
        .number({ error: "A quantidade de questões é obrigatória" })
        .int()
        .positive("A quantidade de questões deve ser maior que zero"),
    choicesCount: z
        .number({ error: "A quantidade de alternativas é obrigatória" })
        .int()
        .positive("Deve haver pelo menos 1 alternativa")
        .max(5, "No máximo 5 alternativas (A-E)"), // Ajuste conforme a sua regra de negócio
    answerKey: z
        .array(z.string().min(1, "A alternativa não pode ser vazia"))
        .nonempty("O gabarito não pode estar vazio"),
});
//# sourceMappingURL=create-exam.js.map