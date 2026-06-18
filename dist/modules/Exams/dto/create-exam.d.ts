import { z } from "zod";
export declare const examValidationSchema: z.ZodObject<{
    title: z.ZodString;
    classId: z.ZodString;
    questionsCount: z.ZodNumber;
    choicesCount: z.ZodNumber;
    answerKey: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type ExamValidationType = z.infer<typeof examValidationSchema>;
//# sourceMappingURL=create-exam.d.ts.map