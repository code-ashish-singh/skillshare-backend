import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    adminHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One review per booking
reviewSchema.index({ booking: 1, user: 1 }, { unique: true });

// Update provider rating after review save
reviewSchema.statics.calcAverageRating = async function (providerId) {
  const stats = await this.aggregate([
    { $match: { provider: providerId, isVisible: true, adminHidden: false } },
    { $group: { _id: "$provider", avgRating: { $avg: "$rating" }, numReviews: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await mongoose.model("User").findByIdAndUpdate(providerId, {
      "providerProfile.rating": Math.round(stats[0].avgRating * 10) / 10,
      "providerProfile.totalReviews": stats[0].numReviews,
    });
  } else {
    await mongoose.model("User").findByIdAndUpdate(providerId, {
      "providerProfile.rating": 0,
      "providerProfile.totalReviews": 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.provider);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRating(doc.provider);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
