import "dotenv/config";
export declare class EmailService {
    private transporter;
    constructor();
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
//# sourceMappingURL=Email.service.d.ts.map