import { z } from "zod";

export const createSubmissionSchema = z.object({
  examId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID inválido"),
  submissions: z
    .array(
      z.object({
        studentName: z.string().min(1, "Nome do aluno é obrigatório"),
        imageUrl: z.string().url("URL inválida"),
      }),
    )
    .min(1, "Envie pelo menos uma submissão"),
});

export const submissionIdParamsSchema = z.object({
  submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const classIdParamsSchema = z.object({
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const examIdQuerySchema = z.object({
  examId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  status: z.enum(["pending", "success", "error"]).optional(),
});

export const examIdParamsSchema = z.object({
  examId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const updateSubmissionSchema = z.object({
  studentName: z.string().min(1).optional(),
  score: z.number().min(0).max(10).optional(),
  totalCorrect: z.number().min(0).optional(),
  details: z
    .array(
      z.object({
        question: z.number(),
        marked: z.string().nullable(),
        correct: z.string(),
        status: z.enum(["correct", "incorrect", "invalid"]),
      }),
    )
    .optional(),
});

export const deleteSubmissionParamsSchema = z.object({
  submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export type CreateSubmissionDTO = z.infer<typeof createSubmissionSchema>;
export type SubmissionItem = CreateSubmissionDTO["submissions"][number];
