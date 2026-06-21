import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Blog from "../models/Blog.js";
import Report from "../models/Report.js";
import Skill from "../models/Skill.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalProviders, totalBookings, openReports,
    pendingProviders, completedBookings, recentBookings, recentUsers,
  ] = await Promise.all([
    User.countDocuments({ role: "skillSeeker" }),
    User.countDocuments({ role: "skillProvider" }),
    Booking.countDocuments(),
    Report.countDocuments({ status: "Open" }),
    User.countDocuments({ role: "skillProvider", "providerProfile.verificationStatus": "Pending" }),
    Booking.countDocuments({ status: "Completed" }),
    Booking.find()
      .sort("-createdAt")
      .limit(8)
      .populate("seeker", "name avatar")
      .populate("provider", "name avatar")
      .populate("skill", "title")
      .populate("plan", "name price"),
    User.find({ role: { $in: ["skillSeeker", "skillProvider"] } })
      .sort("-createdAt")
      .limit(6)
      .select("name email avatar role createdAt isBlocked providerProfile.verificationStatus"),
  ]);

  // Revenue (sum of completed booking amounts)
  const revenueAgg = await Booking.aggregate([
    { $match: { status: "Completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // Monthly revenue for chart (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: "Completed", createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$amount" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Monthly user growth
  const monthlyUsers = await User.aggregate([
    { $match: { role: { $ne: "superAdmin" }, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, role: "$role" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  ApiResponse.success(res, {
    stats: {
      totalUsers, totalProviders, totalBookings, openReports,
      pendingProviders, completedBookings, totalRevenue,
      activeProviders: await User.countDocuments({ role: "skillProvider", isBlocked: false }),
    },
    recentBookings,
    recentUsers,
    monthlyRevenue,
    monthlyUsers,
  }, "Dashboard data fetched.");
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 15 } = req.query;
  const query = { role: "skillSeeker" };

  if (status === "blocked") query.isBlocked = true;
  else if (status === "active") query.isBlocked = false;
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password -passwordChangedAt -passwordResetToken -passwordResetExpires")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, users, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// @desc    Get all providers
// @route   GET /api/admin/providers
// @access  Private (Admin)
export const getAllProviders = asyncHandler(async (req, res) => {
  const { search, status, verification, page = 1, limit = 15 } = req.query;
  const query = { role: "skillProvider" };

  if (status === "blocked") query.isBlocked = true;
  else if (status === "active") query.isBlocked = false;
  if (verification) query["providerProfile.verificationStatus"] = verification;
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const total = await User.countDocuments(query);
  const providers = await User.find(query)
    .select("-password -passwordChangedAt -passwordResetToken")
    .populate("providerProfile.skills", "title category rating completedProjects")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, providers, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// @desc    Approve provider
// @route   PUT /api/admin/providers/:id/approve
// @access  Private (Admin)
export const approveProvider = asyncHandler(async (req, res) => {
  const provider = await User.findOne({ _id: req.params.id, role: "skillProvider" });
  if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

  provider.providerProfile.verificationStatus = "Verified";
  provider.isBlocked = false;
  await provider.save();

  ApiResponse.success(res, { provider: { id: provider._id, name: provider.name, verificationStatus: "Verified" } }, "Provider approved.");
});

// @desc    Reject provider
// @route   PUT /api/admin/providers/:id/reject
// @access  Private (Admin)
export const rejectProvider = asyncHandler(async (req, res) => {
  const provider = await User.findOne({ _id: req.params.id, role: "skillProvider" });
  if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

  provider.providerProfile.verificationStatus = "Rejected";
  await provider.save();

  ApiResponse.success(res, {}, "Provider rejected.");
});

// @desc    Suspend / unsuspend provider or user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  if (user.role === "superAdmin") return res.status(400).json({ success: false, message: "Cannot block admin." });

  user.isBlocked = !user.isBlocked;
  await user.save();

  const action = user.isBlocked ? "blocked" : "unblocked";
  ApiResponse.success(res, { isBlocked: user.isBlocked }, `User ${action} successfully.`);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  if (user.role === "superAdmin") return res.status(400).json({ success: false, message: "Cannot delete admin." });

  await user.deleteOne();
  ApiResponse.success(res, {}, "User deleted permanently.");
});

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
// @access  Private (Admin)
export const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const query = {};
  if (status === "hidden") query.adminHidden = true;
  else if (status === "visible") query.adminHidden = false;

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate("user", "name avatar")
    .populate("provider", "name avatar")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, reviews, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// @desc    Toggle review visibility
// @route   PUT /api/admin/reviews/:id/toggle
// @access  Private (Admin)
export const toggleReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });

  review.adminHidden = !review.adminHidden;
  review.isVisible = !review.adminHidden;
  await review.save();

  const action = review.adminHidden ? "hidden" : "restored";
  ApiResponse.success(res, { adminHidden: review.adminHidden }, `Review ${action}.`);
});

// @desc    Delete review (admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  await review.deleteOne();
  ApiResponse.success(res, {}, "Review deleted.");
});

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalRevenue, bookingsByStatus, topProviders, skillsByCategory,
  ] = await Promise.all([
    Booking.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    User.find({ role: "skillProvider" })
      .sort("-providerProfile.totalEarnings -providerProfile.completedProjects")
      .limit(10)
      .select("name avatar providerProfile.totalEarnings providerProfile.completedProjects providerProfile.rating"),
    Skill.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, bookings: { $sum: "$completedProjects" } } },
      { $sort: { bookings: -1 } },
    ]),
  ]);

  ApiResponse.success(res, {
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCompletedBookings: totalRevenue[0]?.count || 0,
    avgBookingValue: totalRevenue[0] ? Math.round(totalRevenue[0].total / totalRevenue[0].count) : 0,
    bookingsByStatus,
    topProviders,
    skillsByCategory,
  }, "Analytics fetched.");
});
