import { body } from "express-validator";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Seeker)
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findOne({ _id: bookingId, seeker: req.user.id, status: "Completed" });
  if (!booking) return res.status(404).json({ success: false, message: "Completed booking not found." });
  if (booking.isReviewed) return res.status(400).json({ success: false, message: "You already reviewed this booking." });

  const review = await Review.create({
    user: req.user.id,
    provider: booking.provider,
    booking: booking._id,
    skill: booking.skill,
    rating,
    comment,
  });

  await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });
  await review.populate([{ path: "user", select: "name avatar" }, { path: "provider", select: "name avatar" }]);

  ApiResponse.created(res, { review }, "Review submitted.");
});

// @desc    Get provider reviews (public)
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { provider: req.params.providerId, isVisible: true, adminHidden: false };

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate("user", "name avatar")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, reviews, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// @desc    Update my review
// @route   PUT /api/reviews/:id
// @access  Private (Seeker)
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });

  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  await review.save();

  ApiResponse.success(res, { review }, "Review updated.");
});

// @desc    Delete my review
// @route   DELETE /api/reviews/:id
// @access  Private (Seeker)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });

  await Booking.findByIdAndUpdate(review.booking, { isReviewed: false });
  await review.deleteOne();

  ApiResponse.success(res, {}, "Review deleted.");
});

export const reviewValidation = [
  body("bookingId").notEmpty().withMessage("Booking ID required").isMongoId().withMessage("Invalid booking ID"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").trim().isLength({ min: 10, max: 1000 }).withMessage("Comment must be 10–1000 characters"),
];
