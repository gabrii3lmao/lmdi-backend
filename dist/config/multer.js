import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export function generateUploadSignature() {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "letmedoit_uploads";
    const params = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
    return {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
    };
}
export const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    }
    catch (error) {
        console.error("Erro ao deletar imagem do Cloudinary:", error);
        throw new Error("Failed to delete image from Cloudinary");
    }
};
//# sourceMappingURL=multer.js.map