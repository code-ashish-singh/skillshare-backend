import { body } from "express-validator";
import Blog from "../models/Blog.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Get all published blogs (public)
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 9, status } = req.query;

  const query = {};
  // Public gets only published; admin can filter by status
  if (req.user?.role === "superAdmin") {
    if (status) query.status = status;
  } else {
    query.status = "Published";
  }

  if (category) query.category = category;
  if (search) query.$or = [
    { title: { $regex: search, $options: "i" } },
    { excerpt: { $regex: search, $options: "i" } },
  ];

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate("author", "name avatar")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, blogs, {
    total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit),
  });
});

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("author", "name avatar");
  if (!blog) return res.status(404).json({ success: false, message: "Blog not found." });
  if (blog.status !== "Published" && req.user?.role !== "superAdmin") {
    return res.status(404).json({ success: false, message: "Blog not found." });
  }

  // Increment views
  await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  ApiResponse.success(res, { blog });
});

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private (Admin)
export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, status } = req.body;

  const blogData = { title, content, excerpt, category, tags, status, author: req.user.id };
  if (req.file) {
    blogData.coverImage = req.file.path;
    blogData.coverImagePublicId = req.file.filename;
  }

  // Estimate read time (~200 words per minute)
  const wordCount = content.split(/\s+/).length;
  blogData.readTime = `${Math.max(1, Math.round(wordCount / 200))} min`;

  const blog = await Blog.create(blogData);
  await blog.populate("author", "name avatar");

  ApiResponse.created(res, { blog }, "Blog created successfully.");
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ success: false, message: "Blog not found." });

  const allowed = ["title", "content", "excerpt", "category", "tags", "status"];
  allowed.forEach((f) => { if (req.body[f] !== undefined) blog[f] = req.body[f]; });

  if (req.file) {
    blog.coverImage = req.file.path;
    blog.coverImagePublicId = req.file.filename;
  }

  if (req.body.content) {
    const wordCount = req.body.content.split(/\s+/).length;
    blog.readTime = `${Math.max(1, Math.round(wordCount / 200))} min`;
  }

  await blog.save();
  ApiResponse.success(res, { blog }, "Blog updated.");
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ success: false, message: "Blog not found." });
  await blog.deleteOne();
  ApiResponse.success(res, {}, "Blog deleted.");
});

export const blogValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }).withMessage("Max 200 chars"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("category").notEmpty().withMessage("Category is required"),
];
