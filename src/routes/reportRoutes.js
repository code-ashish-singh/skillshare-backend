import express from "express";
import {
  createReport, getMyReports, getAllReports, updateReport, deleteReport,
  reportValidation,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post("/", protect, restrictTo("skillSeeker"), reportValidation, validate, createReport);
router.get("/my", protect, restrictTo("skillSeeker"), getMyReports);

// Admin
router.get("/", protect, restrictTo("superAdmin"), getAllReports);
router.put("/:id", protect, restrictTo("superAdmin"), updateReport);
router.delete("/:id", protect, restrictTo("superAdmin"), deleteReport);

export default router;
