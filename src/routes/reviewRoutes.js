import express from "express";
import {
  createReview, getProviderReviews, updateReview, deleteReview,
  reviewValidation,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.get("/provider/:providerId", getProviderReviews);
router.post("/", protect, restrictTo("skillSeeker"), reviewValidation, validate, createReview);
router.put("/:id", protect, restrictTo("skillSeeker"), updateReview);
router.delete("/:id", protect, restrictTo("skillSeeker"), deleteReview);

export default router;
