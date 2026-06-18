import { HttpException } from "../config/errorHandler.js";
function errorMiddleware(error, req, res, next) {
    if (error instanceof HttpException) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof Error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
}
export default errorMiddleware;
//# sourceMappingURL=errorMiddleware.js.map