const mongoose = require("mongoose");

const reviewsSchema = mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "books",
      required: "true",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
reviewsSchema.index({ book: 1, user: 1 }, { unique: true });

const reviewModel = mongoose.model("reviews", reviewsSchema);
module.exports = reviewModel;
