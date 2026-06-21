import { body } from "express-validator";
import Booking from "../models/Booking.js";
import Plan from "../models/Plan.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Seeker)
export const createBooking = asyncHandler(async (req, res) => {
  const { planId, requirements } = req.body;

  const plan = await Plan.findById(planId).populate("skill");
  if (!plan || !plan.isActive) {
    return res.status(404).json({ success: false, message: "Plan not found or unavailable." });
  }

  // Cannot book own service
  if (plan.provider.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot book your own service." });
  }

  const booking = await Booking.create({
    seeker: req.user.id,
    provider: plan.provider,
    skill: plan.skill._id,
    plan: plan._id,
    amount: plan.price,
    requirements: requirements || "",
  });

  // Update provider's pending projects count
  await User.findByIdAndUpdate(plan.provider, {
    $inc: { "providerProfile.pendingProjects": 1 },
  });
  await Skill.findByIdAndUpdate(plan.skill._id, { $inc: { pendingProjects: 1 } });

  await booking.populate([
    { path: "seeker", select: "name avatar email" },
    { path: "provider", select: "name avatar email" },
    { path: "skill", select: "title category" },
    { path: "plan", select: "name price deliveryTime" },
  ]);

  ApiResponse.created(res, { booking }, "Booking created successfully.");
});

// @desc    Get seeker's bookings
// @route   GET /api/bookings/my
// @access  Private (Seeker)
export const getSeekerBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { seeker: req.user.id };
  if (status) query.status = status;

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate("provider", "name avatar")
    .populate("skill", "title category")
    .populate("plan", "name price deliveryTime")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, bookings, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider)
export const getProviderBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { provider: req.user.id };
  if (status) query.status = status;

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate("seeker", "name avatar email")
    .populate("skill", "title category")
    .populate("plan", "name price deliveryTime")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, bookings, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("seeker", "name avatar email phone")
    .populate("provider", "name avatar email")
    .populate("skill", "title category description")
    .populate("plan");

  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

  // Only seeker or provider can view
  const isOwner = booking.seeker._id.toString() === req.user.id || booking.provider._id.toString() === req.user.id;
  const isAdmin = req.user.role === "superAdmin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: "Not authorized." });
  }

  ApiResponse.success(res, { booking });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

  const isSeeker = booking.seeker.toString() === req.user.id;
  const isProvider = booking.provider.toString() === req.user.id;

  // Validation rules
  if (status === "Accepted" && !isProvider) return res.status(403).json({ success: false, message: "Only provider can accept bookings." });
  if (status === "Completed" && !isProvider) return res.status(403).json({ success: false, message: "Only provider can mark as completed." });
  if (status === "Cancelled" && !isSeeker && !isProvider) return res.status(403).json({ success: false, message: "Not authorized to cancel." });

  const prevStatus = booking.status;
  booking.status = status;
  if (status === "Cancelled") { booking.cancellationReason = cancellationReason || ""; booking.cancelledAt = new Date(); }
  if (status === "Completed") { booking.completedAt = new Date(); }

  await booking.save();

  // Update project counters
  const userId = booking.provider;
  const skillId = booking.skill;

  if (prevStatus === "Pending" && status === "Accepted") {
    await User.findByIdAndUpdate(userId, { $inc: { "providerProfile.pendingProjects": -1, "providerProfile.ongoingProjects": 1 } });
    await Skill.findByIdAndUpdate(skillId, { $inc: { pendingProjects: -1, currentProjects: 1 } });
  } else if (prevStatus === "Accepted" && status === "Completed") {
    await User.findByIdAndUpdate(userId, {
      $inc: { "providerProfile.ongoingProjects": -1, "providerProfile.completedProjects": 1, "providerProfile.totalEarnings": booking.amount },
    });
    await Skill.findByIdAndUpdate(skillId, { $inc: { currentProjects: -1, completedProjects: 1 } });
  } else if (status === "Cancelled") {
    const dec = prevStatus === "Pending" ? "pendingProjects" : "ongoingProjects";
    await User.findByIdAndUpdate(userId, { $inc: { [`providerProfile.${dec}`]: -1 } });
    await Skill.findByIdAndUpdate(skillId, { $inc: { [dec === "pendingProjects" ? "pendingProjects" : "currentProjects"]: -1 } });
  }

  ApiResponse.success(res, { booking }, `Booking ${status.toLowerCase()}.`);
});

// @desc    Cancel booking (seeker)
// @route   DELETE /api/bookings/:id
// @access  Private (Seeker)
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, seeker: req.user.id });
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

  if (!["Pending"].includes(booking.status)) {
    return res.status(400).json({ success: false, message: "Only pending bookings can be cancelled." });
  }

  booking.status = "Cancelled";
  booking.cancelledAt = new Date();
  booking.cancellationReason = req.body.reason || "Cancelled by seeker";
  await booking.save();

  await User.findByIdAndUpdate(booking.provider, { $inc: { "providerProfile.pendingProjects": -1 } });
  await Skill.findByIdAndUpdate(booking.skill, { $inc: { pendingProjects: -1 } });

  ApiResponse.success(res, { booking }, "Booking cancelled.");
});

export const bookingValidation = [
  body("planId").notEmpty().withMessage("Plan ID is required").isMongoId().withMessage("Invalid plan ID"),
];
