import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      enum: ["Basic", "Standard", "Premium"],
    },
    description: {
      type: String,
      required: [true, "Plan description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be at least $1"],
    },
    deliveryTime: {
      type: String,
      required: [true, "Delivery time is required"],
    },
    revisions: {
      type: mongoose.Schema.Types.Mixed,
      default: 2,
    },
    features: [{ type: String }],
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
