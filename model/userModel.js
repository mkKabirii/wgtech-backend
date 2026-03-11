const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },
//     username: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     profileImage: {
//       type: String,
//       default: "",
//     },
//     password: {
//       type: String,
//     required: true,
//     },
//     designation: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "UserRole",
//       required: false,
//     },
//     otp: {
//       type: String,
//       default: "",
//     },
//     otpExpiresAt: {
//       type: Date,
//       default: null,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//     collection: "users",
//   }
// );

// // Ensure collection is created
// mongoose.model("User", userSchema).createCollection();

// module.exports = mongoose.model("User", userSchema);

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
    // ✅ NAYA ADD KARO
    fullname: {
      type: String,
      default: "",
      trim: true,
    },
    // ✅ NAYA ADD KARO
    nationalId: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
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
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

// ✅ LAST LINE BHI FIX KARO — double model error band hoga
mongoose.models.User || mongoose.model("User", userSchema).createCollection();
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
