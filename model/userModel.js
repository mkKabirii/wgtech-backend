const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
    required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRole",
      required: false,
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Ensure collection is created
mongoose.model("User", userSchema).createCollection();

module.exports = mongoose.model("User", userSchema);
