import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const createStorage = (folder) => {
  if (!isCloudinaryConfigured) {
    // Fallback to memory storage if Cloudinary not configured
    return multer.memoryStorage();
  }
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `skillshare/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
  });
};

export const uploadAvatar = multer({
  storage: createStorage("avatars"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPortfolio = multer({
  storage: createStorage("portfolio"),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadBlogCover = multer({
  storage: createStorage("blogs"),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export { cloudinary };
export default cloudinary;
