import { v2 as cloudinary } from "cloudinary";
// @ts-ignore
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import "dotenv/config";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "letmedoit_uploads", // Pasta no Cloudinary
            allowed_formats: ["jpg", "png", "jpeg"], // O Cloudinary já barra o que não for isso
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
    },
});
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