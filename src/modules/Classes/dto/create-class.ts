import { z } from "zod";

export const classValidationSchema = z.object({
  name: z
    .string({ error: "O nome da turma é obrigatório" })
    .trim()
    .min(3, "O nome da turma deve ter pelo menos 3 caracteres")
    .max(50, "O nome da turma é muito longo"),
});

export type ClassValidationType = z.infer<typeof classValidationSchema>;