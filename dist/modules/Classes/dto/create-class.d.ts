import { z } from "zod";
export declare const classValidationSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export type ClassValidationType = z.infer<typeof classValidationSchema>;
//# sourceMappingURL=create-class.d.ts.map