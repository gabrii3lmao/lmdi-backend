import { z } from "zod";
export const userValidationSchema = z.object({
    name: z
        .string({ error: "O nome é obrigatório" })
        .trim()
        .min(1, "O nome não pode estar vazio"),
    email: z.email("Formato de e-mail inválido").toLowerCase(),
    password: z
        .string({ error: "A senha é obrigatória" })
        .min(6, "A senha deve ter no mínimo 6 caracteres"),
    resetPasswordToken: z.string().optional(),
});
export const loginValidationSchema = z.object({
    email: z.email("Formato de e-mail inválido").toLowerCase(),
    password: z
        .string({ error: "A senha é obrigatória" })
        .min(6, "A senha deve ter no mínimo 6 caracteres"),
});
//# sourceMappingURL=User.dto.js.map