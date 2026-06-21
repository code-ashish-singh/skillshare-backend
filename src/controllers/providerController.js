import { body } from "express-validator";
import Skill from "../models/Skill.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// ─── SKILLS ───────────────────────────────────────────────────────────────────

// @desc    Create a skill
// @route   POST /api/providers/skills
// @access  Private (Provider)
export const createSkill = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;

  const skill = await Skill.create({
    title, description, category, tags,
    provider: req.user.id,
  });

  // Add skill to provider's profile
  await User.findByIdAndUpdate(req.user.id, {
    $push: { "providerProfile.skills": skill._id },
  });

  await skill.populate("provider", "name avatar");
  ApiResponse.created(res, { skill }, "Skill created successfully.");
});

// @desc    Get all skills (public)
// @route   GET /api/providers/skills
// @access  Public
export const getAllSkills = asyncHandler(async (req, res) => {
  const { category, search, sort = "-createdAt", page = 1, limit = 12, minRating } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;
  if (minRating) query.rating = { $gte: parseFloat(minRating) };
  if (search) query.$text = { $search: search };

  const total = await Skill.countDocuments(query);
  const skills = await Skill.find(query)
    .populate("provider", "name avatar providerProfile.rating providerProfile.verificationStatus isBlocked")
    .populate("plans")
    .sort(sort)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, skills, {
    total, page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit),
  });
});

// @desc    Get my skills (provider)
// @route   GET /api/providers/my-skills
// @access  Private (Provider)
export const getMySkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({ provider: req.user.id })
    .populate("plans")
    .sort("-createdAt");

  ApiResponse.success(res, { skills, count: skills.length }, "Skills fetched.");
});

// @desc    Get single skill
// @route   GET /api/providers/skills/:id
// @access  Public
export const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id)
    .populate("provider", "name avatar bio providerProfile location")
    .populate("plans");

  if (!skill) return res.status(404).json({ success: false, message: "Skill not found." });

  ApiResponse.success(res, { skill });
});

// @desc    Update a skill
// @route   PUT /api/providers/skills/:id
// @access  Private (Provider)
export const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, provider: req.user.id });
  if (!skill) return res.status(404).json({ success: false, message: "Skill not found or not authorized." });

  const allowedUpdates = ["title", "description", "category", "tags", "isActive"];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) skill[field] = req.body[field];
  });

  await skill.save();
  ApiResponse.success(res, { skill }, "Skill updated.");
});

// @desc    Delete a skill
// @route   DELETE /api/providers/skills/:id
// @access  Private (Provider)
export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, provider: req.user.id });
  if (!skill) return res.status(404).json({ success: false, message: "Skill not found or not authorized." });

  // Delete all plans belonging to this skill
  await Plan.deleteMany({ skill: skill._id });

  await skill.deleteOne();
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { "providerProfile.skills": skill._id },
  });

  ApiResponse.success(res, {}, "Skill deleted.");
});

// ─── PLANS ────────────────────────────────────────────────────────────────────

// @desc    Create a plan for a skill
// @route   POST /api/providers/skills/:skillId/plans
// @access  Private (Provider)
export const createPlan = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.skillId, provider: req.user.id });
  if (!skill) return res.status(404).json({ success: false, message: "Skill not found." });

  const { name, description, price, deliveryTime, revisions, features } = req.body;

  // Check if plan name already exists for this skill
  const existingPlan = await Plan.findOne({ skill: skill._id, name });
  if (existingPlan) return res.status(400).json({ success: false, message: `${name} plan already exists for this skill.` });

  const plan = await Plan.create({
    name, description, price, deliveryTime, revisions, features,
    skill: skill._id,
    provider: req.user.id,
  });

  await Skill.findByIdAndUpdate(skill._id, { $push: { plans: plan._id } });

  // Update starting price
  const allPlans = await Plan.find({ skill: skill._id });
  const minPrice = Math.min(...allPlans.map((p) => p.price));
  await Skill.findByIdAndUpdate(skill._id, { startingPrice: minPrice });

  ApiResponse.created(res, { plan }, "Plan created.");
});

// @desc    Update a plan
// @route   PUT /api/providers/plans/:id
// @access  Private (Provider)
export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ _id: req.params.id, provider: req.user.id });
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found." });

  const allowed = ["description", "price", "deliveryTime", "revisions", "features", "isActive"];
  allowed.forEach((f) => { if (req.body[f] !== undefined) plan[f] = req.body[f]; });
  await plan.save();

  ApiResponse.success(res, { plan }, "Plan updated.");
});

// @desc    Delete a plan
// @route   DELETE /api/providers/plans/:id
// @access  Private (Provider)
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ _id: req.params.id, provider: req.user.id });
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found." });

  await Skill.findByIdAndUpdate(plan.skill, { $pull: { plans: plan._id } });
  await plan.deleteOne();

  ApiResponse.success(res, {}, "Plan deleted.");
});

// Validators
export const skillValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }).withMessage("Max 100 chars"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").notEmpty().withMessage("Category is required"),
];

export const planValidation = [
  body("name").isIn(["Basic", "Standard", "Premium"]).withMessage("Plan must be Basic, Standard, or Premium"),
  body("price").isNumeric().withMessage("Price must be a number").custom((v) => v > 0).withMessage("Price must be > 0"),
  body("deliveryTime").notEmpty().withMessage("Delivery time is required"),
];
