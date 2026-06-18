export class HttpException extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
//# sourceMappingURL=errorHandler.js.map