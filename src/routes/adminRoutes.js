import express from "express";
import {
  getDashboard, getAllUsers, getAllProviders,
  approveProvider, rejectProvider, toggleBlockUser, deleteUser,
  getAllReviews, toggleReviewVisibility, deleteReview, getAnalytics,
} from "../controllers/adminController.js";
import { getAllBlogs, createBlog, updateBlog, deleteBlog } from "../controllers/blogController.js";
import { getAllReports, updateReport, deleteReport } from "../controllers/reportController.js";
import Booking from "../models/Booking.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { handleUpload, blogCoverUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All admin routes are protected
router.use(protect, restrictTo("superAdmin"));

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);

router.get("/users", getAllUsers);
router.put("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);

router.get("/providers", getAllProviders);
router.put("/providers/:id/approve", approveProvider);
router.put("/providers/:id/reject", rejectProvider);
router.put("/providers/:id/block", toggleBlockUser);
router.delete("/providers/:id", deleteUser);

router.get("/bookings", asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 15 } = req.query;
  const query = {};
  if (status) query.status = status;
  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate("seeker", "name avatar email")
    .populate("provider", "name avatar email")
    .populate("skill", "title category")
    .populate("plan", "name price")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));
  ApiResponse.paginated(res, bookings, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
}));

router.get("/reviews", getAllReviews);
router.put("/reviews/:id/toggle", toggleReviewVisibility);
router.delete("/reviews/:id", deleteReview);

router.get("/blogs", getAllBlogs);
router.post("/blogs", handleUpload(blogCoverUpload), createBlog);
router.put("/blogs/:id", handleUpload(blogCoverUpload), updateBlog);
router.delete("/blogs/:id", deleteBlog);

router.get("/reports", getAllReports);
router.put("/reports/:id", updateReport);
router.delete("/reports/:id", deleteReport);

export default router;
