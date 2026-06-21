import express from "express";
import {
  register, login, logout, getMe, changePassword, updateProfile,
  registerValidation, loginValidation,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { handleUpload, avatarUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/update-profile", protect, handleUpload(avatarUpload), updateProfile);

export default router;
