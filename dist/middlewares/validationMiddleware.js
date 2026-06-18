import { ZodError } from "zod";
export function validate(schema, target = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation Failed",
                errors: formatZodError(result.error),
            });
        }
        if (target === "query" || target === "params") {
            Object.assign(req[target], result.data);
        }
        else {
            req[target] = result.data;
        }
        next();
    };
}
function formatZodError(error) {
    return error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
    }));
}
//# sourceMappingURL=validationMiddleware.js.map