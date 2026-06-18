import { z } from "zod";
export declare const createSubmissionSchema: z.ZodObject<{
    examId: z.ZodString;
}, z.core.$strip>;
export declare const submissionIdParamsSchema: z.ZodObject<{
    submissionId: z.ZodString;
}, z.core.$strip>;
export declare const classIdParamsSchema: z.ZodObject<{
    classId: z.ZodString;
}, z.core.$strip>;
export declare const examIdQuerySchema: z.ZodObject<{
    examId: z.ZodString;
}, z.core.$strip>;
export type CreateSubmissionDTO = z.infer<typeof createSubmissionSchema>;
//# sourceMappingURL=submission.dto.d.ts.map