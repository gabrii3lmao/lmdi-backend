import "dotenv/config";
export interface UploadSignature {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}
export declare function generateUploadSignature(): UploadSignature;
export declare const deleteImage: (publicId: string) => Promise<void>;
//# sourceMappingURL=multer.d.ts.map