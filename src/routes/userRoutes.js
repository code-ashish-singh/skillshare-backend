import express from "express";
import {
  getAllProviders, getProviderById,
  updateProviderProfile, addPortfolioImage, deletePortfolioImage,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { handleUpload, portfolioUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/providers", getAllProviders);
router.get("/providers/:id", getProviderById);

// Provider only
router.put("/provider-profile", protect, restrictTo("skillProvider"), updateProviderProfile);
router.post("/portfolio", protect, restrictTo("skillProvider"), handleUpload(portfolioUpload), addPortfolioImage);
router.delete("/portfolio/:publicId", protect, restrictTo("skillProvider"), deletePortfolioImage);

export default router;
