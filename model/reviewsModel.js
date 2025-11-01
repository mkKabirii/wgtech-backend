const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

// Ensure collection is created
mongoose.model("Review", reviewSchema).createCollection();

module.exports = mongoose.model("Review", reviewSchema);
