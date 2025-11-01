const Customer = require("../model/customer/customerModel");
const Restaurant = require("../model/restaurant/restaurantModel");
const User = require("../model/user/userModel");
const AppError = require("./appError");

const verifyOtpHelper = async ({ email, otp, modelType = "customer" }, next) => {
  let model;
  
  if (modelType === "restaurant") {
    model = Restaurant;
  } else if (modelType === "user") {
    model = User;
  } else {
    model = Customer;
  }

  const entity = await model.findOne({ email });

  if (!entity) {
    let entityType = "Customer";
    if (modelType === "restaurant") entityType = "Restaurant";
    else if (modelType === "user") entityType = "User";
    return next(new AppError(`${entityType} not found`, 404));
  }

  if (entity.otp !== otp) {
    return next(new AppError("Invalid OTP. Please try again.", 400));
  }

  if (Date.now() > entity.otpExpiresAt) {
    return next(new AppError("OTP has expired. Please request a new one.", 400));
  }

  // Clear OTP after successful verification
  entity.otp = "";
  entity.otpExpiresAt = null;
  entity.isVerified = true;
  await entity.save();

  return true;
};

module.exports = { verifyOtpHelper };
