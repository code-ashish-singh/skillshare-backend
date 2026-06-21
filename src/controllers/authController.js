import { body } from "express-validator";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokenCookie } from "../utils/generateToken.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered." });
  }

  // Only allow seeker/provider registration; admin created manually
  const allowedRoles = ["skillSeeker", "skillProvider"];
  const userRole = allowedRoles.includes(role) ? role : "skillSeeker";

  const user = await User.create({ name, email, password, role: userRole });
  sendTokenCookie(user, 201, res, "Registration successful! Welcome to SkillShare.");
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  if (user.isBlocked) {
    return res.status(403).json({ success: false, message: "Your account has been blocked. Contact support." });
  }

  sendTokenCookie(user, 200, res, "Login successful!");
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  ApiResponse.success(res, {}, "Logged out successfully.");
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("providerProfile.skills")
    .lean();
  ApiResponse.success(res, { user }, "User fetched successfully.");
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: "Current password is incorrect." });
  }

  user.password = newPassword;
  await user.save();

  sendTokenCookie(user, 200, res, "Password changed successfully.");
});

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "bio", "phone", "location"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Handle avatar upload
  if (req.file) {
    updates.avatar = req.file.path;
    updates.avatarPublicId = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { user }, "Profile updated successfully.");
});

// Validators
export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["skillSeeker", "skillProvider"]).withMessage("Invalid role"),
];

export const loginValidation = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
