// // model/User.js
// // const mongoose = require("mongoose");

// // const userSchema = new mongoose.Schema(
// //   {
// //     fullname: { type: String, required: true, minlength: 3 },
// //     email:    { type: String, required: true, unique: true, lowercase: true },
// //     password: { type: String, required: true, select: false },
// //   },
// //   { timestamps: true }
// // );

// // module.exports = mongoose.model("User", userSchema);

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     fullname: {
//       type: String,
//       required: [true, "Full name is required"],
//       minlength: 3,
//       maxlength: 120,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 6,
//       select: false, // ← query mein automatically nahi aayega
//     },
//     nationalId: {
//       type: String,
//       default: null,
//     },
// //   },
//   { timestamps: true }
// );

// // module.exports = mongoose.model("User", userSchema);
// module.exports = mongoose.models.User || mongoose.model("User", userSchema);