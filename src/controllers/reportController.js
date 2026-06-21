import { body } from "express-validator";
import Report from "../models/Report.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Create report
// @route   POST /api/reports
// @access  Private (Seeker)
export const createReport = asyncHandler(async (req, res) => {
  const { reportedProvider, reason, description, bookingId } = req.body;

  // One active report per provider per user
  const existing = await Report.findOne({
    reporter: req.user.id,
    reportedProvider,
    status: { $in: ["Open", "Under Review"] },
  });
  if (existing) {
    return res.status(400).json({ success: false, message: "You already have an open report against this provider." });
  }

  const report = await Report.create({
    reporter: req.user.id,
    reportedProvider,
    reason,
    description,
    booking: bookingId || undefined,
  });

  await report.populate([
    { path: "reporter", select: "name avatar email" },
    { path: "reportedProvider", select: "name avatar email" },
  ]);

  ApiResponse.created(res, { report }, "Report submitted successfully.");
});

// @desc    Get my reports
// @route   GET /api/reports/my
// @access  Private (Seeker)
export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporter: req.user.id })
    .populate("reportedProvider", "name avatar")
    .sort("-createdAt");
  ApiResponse.success(res, { reports, count: reports.length });
});

// @desc    Get all reports (admin)
// @route   GET /api/reports
// @access  Private (Admin)
export const getAllReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;

  const total = await Report.countDocuments(query);
  const reports = await Report.find(query)
    .populate("reporter", "name avatar email")
    .populate("reportedProvider", "name avatar email")
    .populate("booking", "amount status")
    .sort("-createdAt")
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  ApiResponse.paginated(res, reports, {
    total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)),
  });
});

// @desc    Update report status (admin)
// @route   PUT /api/reports/:id
// @access  Private (Admin)
export const updateReport = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: "Report not found." });

  report.status = status;
  if (adminNotes) report.adminNotes = adminNotes;
  if (status === "Resolved" || status === "Closed") {
    report.resolvedAt = new Date();
    report.resolvedBy = req.user.id;
  }
  await report.save();

  ApiResponse.success(res, { report }, `Report marked as ${status}.`);
});

// @desc    Delete report (admin)
// @route   DELETE /api/reports/:id
// @access  Private (Admin)
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: "Report not found." });
  await report.deleteOne();
  ApiResponse.success(res, {}, "Report deleted.");
});

export const reportValidation = [
  body("reportedProvider").notEmpty().withMessage("Provider ID required").isMongoId().withMessage("Invalid provider ID"),
  body("reason").notEmpty().withMessage("Reason is required"),
  body("description").trim().isLength({ min: 20, max: 2000 }).withMessage("Description must be 20–2000 characters"),
];
