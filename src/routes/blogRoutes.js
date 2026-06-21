import express from "express";
import {
  getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog,
  blogValidation,
} from "../controllers/blogController.js";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { handleUpload, blogCoverUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", protect, restrictTo("superAdmin"), handleUpload(blogCoverUpload), blogValidation, validate, createBlog);
router.put("/:id", protect, restrictTo("superAdmin"), handleUpload(blogCoverUpload), updateBlog);
router.delete("/:id", protect, restrictTo("superAdmin"), deleteBlog);

export default router;
