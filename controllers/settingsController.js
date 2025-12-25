const Settings = require("../model/settingsModal");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createSettingsSchema, updateSettingsSchema } = require("../utils/validation");

// Create Settings
const createSettings = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createSettingsSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  // Check if settings already exists
  const existingSettings = await Settings.findOne();
  if (existingSettings) {
    return next(new AppError("Settings already exists. Use update endpoint to modify.", 400));
  }

  const { privacyPolicy, termsCondition } = validatedData;

  const settings = await Settings.create({
    privacyPolicy,
    termsCondition
  });

  successHandler(res, settings, "Settings created successfully", 201);
});

// Get Settings
const getSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne().sort({ createdAt: -1 });

  if (!settings) {
    return next(new AppError("Settings not found", 404));
  }

  successHandler(res, settings, "Settings retrieved successfully");
});

// Update Settings
const updateSettings = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, updateSettingsSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  // Find the settings document (there should be only one)
  let settings = await Settings.findOne();

  if (!settings) {
    // If no settings exist, create one
    settings = await Settings.create(validatedData);
    return successHandler(res, settings, "Settings created successfully", 201);
  }

  // Update existing settings
  settings = await Settings.findByIdAndUpdate(
    settings._id,
    validatedData,
    { new: true, runValidators: true }
  );

  successHandler(res, settings, "Settings updated successfully");
});

module.exports = {
  createSettings,
  getSettings,
  updateSettings
};

