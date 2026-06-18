import { z } from "zod";
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export interface PaginatedResponse<T> {
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}
//# sourceMappingURL=pagination.dto.d.ts.map