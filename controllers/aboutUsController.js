const AboutUs = require("../model/aboutUsModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createAboutUsSchema } = require("../utils/validation");

// Create About Us
const createAboutUs = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createAboutUsSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { description, image } = validatedData;

  const aboutUs = await AboutUs.create({
    description,
    image
  });

  successHandler(res, aboutUs, "About Us created successfully", 201);
});

// Get All About Us
const getAllAboutUs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const aboutUs = await AboutUs.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await AboutUs.countDocuments();

  successHandler(res, {
    aboutUs,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "About Us retrieved successfully");
});

// Get About Us by ID
const getAboutUsById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const aboutUs = await AboutUs.findById(id);

  if (!aboutUs) {
    return next(new AppError("About Us not found", 404));
  }

  successHandler(res, aboutUs, "About Us retrieved successfully");
});

// Update About Us
const updateAboutUs = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const aboutUs = await AboutUs.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!aboutUs) {
    return next(new AppError("About Us not found", 404));
  }

  successHandler(res, aboutUs, "About Us updated successfully");
});

// Delete About Us
const deleteAboutUs = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const aboutUs = await AboutUs.findByIdAndDelete(id);

  if (!aboutUs) {
    return next(new AppError("About Us not found", 404));
  }

  successHandler(res, null, "About Us deleted successfully");
});

module.exports = {
  createAboutUs,
  getAllAboutUs,
  getAboutUsById,
  updateAboutUs,
  deleteAboutUs
};
