import { z } from "zod";
export declare const userValidationSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    resetPasswordToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginValidationSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type UserValidationType = z.infer<typeof userValidationSchema>;
//# sourceMappingURL=User.dto.d.ts.map