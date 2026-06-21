import { uploadAvatar, uploadPortfolio, uploadBlogCover } from "../config/cloudinary.js";

export const avatarUpload = uploadAvatar.single("avatar");
export const portfolioUpload = uploadPortfolio.array("portfolio", 6);
export const blogCoverUpload = uploadBlogCover.single("coverImage");

// Middleware that handles multer errors gracefully
export const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};
