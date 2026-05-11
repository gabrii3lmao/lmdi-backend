import type { Request, Response, NextFunction } from "express";
import { type ZodTypeAny, ZodError } from "zod";

type ValidationTarget = "body" | "params" | "query";

export function validate(
  schema: ZodTypeAny,
  target: ValidationTarget = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: formatZodError(result.error),
      });
    }

    if (target === "query" || target === "params") {
      Object.assign(req[target], result.data);
    } else {
      req[target] = result.data;
    }
    next();
  };
}

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
