// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const UserModel = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("You are not logged in!", 401));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await UserModel.findById(decoded.id)
    .populate("designation", "roleName assignedPages")
    .select("-password");

  if (!user) return next(new AppError("User no longer exists", 401));

  if (!user.isActive)
    return next(new AppError("User not active. Please contact Admin", 401));

  req.user = user;
  next();
});

const authorize = (roles) => {
  return catchAsync(async (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      return next(
        new AppError("You are not authorized to access this resource", 403)
      );
    }
    next();
  });
};


module.exports = { protect, authorize };
