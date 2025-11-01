const OurStory = require("../model/ourStoryModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createOurStorySchema } = require("../utils/validation");

// Create Our Story
const createOurStory = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createOurStorySchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { title, description } = validatedData;

  const ourStory = await OurStory.create({
    title,
    description
  });

  successHandler(res, ourStory, "Our Story created successfully", 201);
});

// Get All Our Stories
const getAllOurStories = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const ourStories = await OurStory.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await OurStory.countDocuments();

  successHandler(res, {
    ourStories,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "Our Stories retrieved successfully");
});

// Get Our Story by ID
const getOurStoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ourStory = await OurStory.findById(id);

  if (!ourStory) {
    return next(new AppError("Our Story not found", 404));
  }

  successHandler(res, ourStory, "Our Story retrieved successfully");
});

// Update Our Story
const updateOurStory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const ourStory = await OurStory.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!ourStory) {
    return next(new AppError("Our Story not found", 404));
  }

  successHandler(res, ourStory, "Our Story updated successfully");
});

// Delete Our Story
const deleteOurStory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ourStory = await OurStory.findByIdAndDelete(id);

  if (!ourStory) {
    return next(new AppError("Our Story not found", 404));
  }

  successHandler(res, null, "Our Story deleted successfully");
});

module.exports = {
  createOurStory,
  getAllOurStories,
  getOurStoryById,
  updateOurStory,
  deleteOurStory
};
