const User = require("../model/userModel");
const UserRole = require("../model/userRole");
const { successHandler, signToken } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { hashPassword, comparePassword } = require("../utils/helper");
const { schemaValidator } = require("../utils/schemaValidator");
const { createUserSchema } = require("../utils/validation");
// const { generateToken } = require("../utils/jwt");

// Create User
const createUser = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createUserSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { email, username, password, role, designation, profileImage } = validatedData;

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

  const token = signToken(user._id);  // generate token

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
    "Users retrieved successfully"
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
    `User ${user.isActive ? "activated" : "deactivated"} successfully`
  );
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
