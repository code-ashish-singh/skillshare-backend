import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Skill title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Skill description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX Design",
        "Graphic Design",
        "Content Writing",
        "Digital Marketing",
        "Data Science",
        "Video Production",
        "Photography",
        "Other",
      ],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],
    tags: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    currentProjects: { type: Number, default: 0 },
    pendingProjects: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startingPrice: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

skillSchema.index({ category: 1 });
skillSchema.index({ provider: 1 });
skillSchema.index({ title: "text", description: "text", tags: "text" });

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
