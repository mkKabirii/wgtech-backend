const User = require("../model/userModel");
const UserRole = require("../model/userRole");
const { successHandler, signToken } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { hashPassword, comparePassword } = require("../utils/helper");
const { schemaValidator } = require("../utils/schemaValidator");
const { createUserSchema } = require("../utils/validation");
// const { generateToken } = require("../utils/jwt");

// const { generateToken } = require("../utils/jwt");

// ✅ Multer setup for profile picture
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ✅ 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP allowed"), false);
    }
  },
}).single("profilePicture");

// Create User
// Create User
const createUser = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createUserSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { email, username, password, role, designation, profileImage } =
    validatedData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    username,
    password: hashedPassword,
    role,
    designation,
  });

  // Remove password from response
  user.password = undefined;

  successHandler(res, user, "User created successfully", 201);
});

const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("designation");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid password", 400));
  }

  const token = signToken(user._id); // generate token

  successHandler(res, { user, token }, "User logged in successfully", 200);
});

// Get All Users
const getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, role, isActive } = req.query;

  let filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const users = await User.find(filter)
    .populate("designation", "roleName")
    .select("-password")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  successHandler(
    res,
    {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Users retrieved successfully",
  );
});

// Get User by ID
const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .populate("designation", "roleName routes")
    .select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  successHandler(res, user, "User retrieved successfully");
});

// Update User
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // If password is being updated, hash it
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("designation", "roleName routes");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Remove password from response
  user.password = undefined;

  successHandler(res, user, "User updated successfully");
});

// Delete User
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  successHandler(res, null, "User deleted successfully");
});

// GET /api/v1/users/profile
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return next(new AppError("User not found", 404));
  successHandler(res, user, "Profile fetched successfully");
});

// PUT /api/v1/users/profile
const updateProfile = catchAsync(async (req, res, next) => {
  const { fullname, email, password } = req.body;
  const updateData = { fullname, email };

  if (password) {
    const bcrypt = require("bcryptjs");
    updateData.password = await bcrypt.hash(password, 12);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  successHandler(res, user, "Profile updated successfully");
});

// module.exports = { ..., getProfile, updateProfile };
// Toggle User Status
const toggleUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = !user.isActive;
  await user.save();

  successHandler(
    res,
    user,
    `User ${user.isActive ? "activated" : "deactivated"} successfully`,
  );
});

// ✅ FORGOT PASSWORD — OTP Send
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("No account found with this email", 404));

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP in user
  user.resetOtp = otp;
  user.resetOtpExpiry = otpExpiry;
  await user.save();

  // Send OTP email
  try {
    const EmailService = require("../utils/emailService");
    const emailService = new EmailService(email);
    await emailService.send({
      subject: "🔐 Password Reset OTP - WG Tech Solutions",
      message: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#111;color:#fff;border-radius:12px;">
          <h2 style="color:#9EFF00;">Password Reset Request</h2>
          <p>Hi <strong>${user.fullname || user.username}</strong>,</p>
          <p>Your OTP for password reset is:</p>
          <div style="background:#1a1a1a;border:2px solid #9EFF00;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <h1 style="color:#9EFF00;font-size:48px;letter-spacing:8px;margin:0;">${otp}</h1>
          </div>
          <p style="color:#aaa;">This OTP expires in <strong style="color:#fff;">10 minutes</strong>.</p>
          <p style="color:#aaa;">If you didn't request this, please ignore this email.</p>
          <hr style="border-color:#333;margin:20px 0;">
          <p style="color:#666;font-size:12px;">WG Tech Solutions Team</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("OTP email failed:", emailErr.message);
    return next(new AppError("Failed to send OTP email", 500));
  }

  successHandler(res, null, "OTP sent to your email");
});

// ✅ VERIFY OTP + RESET PASSWORD
const resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return next(new AppError("Email, OTP and new password are required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  // Check OTP
  if (user.resetOtp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  // Check expiry
  if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
    return next(new AppError("OTP has expired. Please request a new one", 400));
  }

  // Hash new password
  const bcrypt = require("bcryptjs");
  user.password = await bcrypt.hash(newPassword, 12);
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  successHandler(res, null, "Password reset successfully! Please login.");
});
// ✅ UPDATE PROFILE PICTURE
// const updateProfilePicture = catchAsync(async (req, res, next) => {
//   const multer = require("multer");
//   const path = require("path");
//   const fs = require("fs");

//   // Upload directory
//   const uploadDir = path.join(__dirname, "../uploads/profiles");
//   if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       cb(null, `profile_${req.user._id}${ext}`);
//     },
//   });

//   const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }).single("profilePicture");

//   upload(req, res, async (err) => {
//     if (err) return next(new AppError("Upload failed: " + err.message, 400));
//     if (!req.file) return next(new AppError("No file uploaded", 400));

//     const profilePicture = `/uploads/profiles/${req.file.filename}`;

//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { profilePicture },
//       { new: true }
//     ).select("-password");

//     successHandler(res, user, "Profile picture updated successfully");
//   });
// });
const updateProfilePicture = (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) return next(new AppError("Upload failed: " + err.message, 400));
    if (!req.file) return next(new AppError("No file uploaded", 400));

    try {
      const profilePicture = `/uploads/profiles/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilePicture },
        { new: true },
      ).select("-password");

      successHandler(res, user, "Profile picture updated successfully");
    } catch (error) {
      next(new AppError("Database update failed", 500));
    }
  });
};
module.exports = {
  getProfile,
  createUser,
  updateProfile,
  loginUser,
  updateProfilePicture, // ✅
  forgotPassword, // ✅
  resetPassword, // ✅
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
