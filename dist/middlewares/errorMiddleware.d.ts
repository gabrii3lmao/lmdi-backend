import type { Request, Response, NextFunction } from "express";
declare function errorMiddleware(error: unknown, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>>;
export default errorMiddleware;
//# sourceMappingURL=errorMiddleware.d.ts.map