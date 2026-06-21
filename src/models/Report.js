import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
    },
    reportedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reported provider is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      enum: [
        "Late Delivery",
        "Poor Quality",
        "Plagiarism",
        "Unprofessional Behavior",
        "Scope Creep",
        "Payment Dispute",
        "Fraud",
        "Other",
      ],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["Open", "Under Review", "Resolved", "Closed"],
      default: "Open",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1 });
reportSchema.index({ reporter: 1 });

const Report = mongoose.model("Report", reportSchema);
export default Report;
