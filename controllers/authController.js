const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// ─── REGISTER ─────────────────────────────────────
exports.register = catchAsync(async (req, res, next) => {
  const { fullname, email, password, nationalId } = req.body;

  // 1. Check karo email pehle se exist karta hai?
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // 2. Password encrypt karo
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. User banao DB mein
  const user = await User.create({
    fullname,
    username: fullname, 
    email,
    password: hashedPassword,
    nationalId: nationalId || null,
  });

  // 4. JWT token banao
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 5. Response bhejo
  res.status(201).json({
    status: "success",
    data: {
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        nationalId: user.nationalId,
      },
    },
  });
});

// ─── LOGIN ────────────────────────────────────────
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. User dhundo email se
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    // ⚠️ 404 return karo — frontend issi se decide karta hai register karna hai
    return next(new AppError("No account found with this email", 404));
  }

  // 2. Password check karo
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Incorrect password", 401));
  }

  // 3. Token banao
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 4. Response bhejo
  res.status(200).json({
    status: "success",
    data: {
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        nationalId: user.nationalId,
      },
    },
  });
});