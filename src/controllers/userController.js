import User from "../models/User.js";
import Booking from "../models/Booking.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Get all providers (public)
// @route   GET /api/users/providers
// @access  Public
export const getAllProviders = asyncHandler(async (req, res) => {
  const { search, sort = "-createdAt", page = 1, limit = 12, minRating } = req.query;

  const query = { role: "skillProvider", isBlocked: false, "providerProfile.verificationStatus": "Verified" };

  if (minRating) query["providerProfile.rating"] = { $gte: parseFloat(minRating) };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  // Safe sort — only allow known fields to prevent crash
  const ALLOWED_SORTS = {
    "-providerProfile.rating": { "providerProfile.rating": -1 },
    "-providerProfile.completedProjects": { "providerProfile.completedProjects": -1 },
    "-createdAt": { createdAt: -1 },
    "createdAt": { createdAt: 1 },
  };
  const sortObj = ALLOWED_SORTS[sort] || { createdAt: -1 };

  const total = await User.countDocuments(query);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const results = await User.find(query)
    .select("-password -passwordChangedAt -passwordResetToken -passwordResetExpires")
    .populate("providerProfile.skills", "title category rating completedProjects startingPrice")
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, results, {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    limit: parseInt(limit),
  });
});

// @desc    Get single provider profile (public)
// @route   GET /api/users/providers/:id
// @access  Public
export const getProviderById = asyncHandler(async (req, res) => {
  const provider = await User.findOne({
    _id: req.params.id,
    role: "skillProvider",
    isBlocked: false,
  })
    .select("-password -passwordChangedAt -passwordResetToken -passwordResetExpires")
    .populate({
      path: "providerProfile.skills",
      populate: { path: "plans" },
    });

  if (!provider) {
    return res.status(404).json({ success: false, message: "Provider not found." });
  }

  ApiResponse.success(res, { provider }, "Provider fetched successfully.");
});

// @desc    Update provider social links / profile details
// @route   PUT /api/users/provider-profile
// @access  Private (Provider)
export const updateProviderProfile = asyncHandler(async (req, res) => {
  const { bio, phone, location, socialLinks, languages, responseTime } = req.body;

  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (phone !== undefined) updates.phone = phone;
  if (location !== undefined) updates.location = location;
  if (responseTime !== undefined) updates["providerProfile.responseTime"] = responseTime;
  if (languages !== undefined) updates["providerProfile.languages"] = languages;
  if (socialLinks) {
    if (socialLinks.website !== undefined) updates["providerProfile.socialLinks.website"] = socialLinks.website;
    if (socialLinks.linkedin !== undefined) updates["providerProfile.socialLinks.linkedin"] = socialLinks.linkedin;
    if (socialLinks.github !== undefined) updates["providerProfile.socialLinks.github"] = socialLinks.github;
    if (socialLinks.twitter !== undefined) updates["providerProfile.socialLinks.twitter"] = socialLinks.twitter;
  }

  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true })
    .select("-password")
    .populate("providerProfile.skills");

  ApiResponse.success(res, { user }, "Provider profile updated.");
});

// @desc    Add portfolio image
// @route   POST /api/users/portfolio
// @access  Private (Provider)
export const addPortfolioImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload an image." });
  }

  const { title = "", description = "" } = req.body;

  const portfolioItem = {
    imageUrl: req.file.path,
    publicId: req.file.filename,
    title,
    description,
  };

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $push: { "providerProfile.portfolio": portfolioItem } },
    { new: true }
  ).select("-password");

  ApiResponse.success(res, { portfolio: user.providerProfile.portfolio }, "Portfolio image added.");
});

// @desc    Delete portfolio image
// @route   DELETE /api/users/portfolio/:publicId
// @access  Private (Provider)
export const deletePortfolioImage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { "providerProfile.portfolio": { publicId: req.params.publicId } } },
    { new: true }
  ).select("-password");

  ApiResponse.success(res, { portfolio: user.providerProfile.portfolio }, "Portfolio image removed.");
});
