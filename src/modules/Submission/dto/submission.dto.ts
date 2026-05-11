import { z } from "zod";

export const createSubmissionSchema = z.object({
  examId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID inválido"),
});

export const submissionIdParamsSchema = z.object({
  submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const classIdParamsSchema = z.object({
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const examIdQuerySchema = z.object({
  examId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export type CreateSubmissionDTO = z.infer<typeof createSubmissionSchema>;
