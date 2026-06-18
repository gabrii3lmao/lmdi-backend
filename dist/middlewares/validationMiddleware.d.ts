import type { Request, Response, NextFunction } from "express";
import { type ZodTypeAny } from "zod";
type ValidationTarget = "body" | "params" | "query";
export declare function validate(schema: ZodTypeAny, target?: ValidationTarget): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validationMiddleware.d.ts.map