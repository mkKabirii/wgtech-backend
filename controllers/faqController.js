const FAQ = require("../model/faqModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createFAQSchema } = require("../utils/validation");

// Create FAQ
const createFAQ = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createFAQSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { title, body } = validatedData;

  const faq = await FAQ.create({
    title,
    body
  });

  successHandler(res, faq, "FAQ created successfully", 201);
});

// Get All FAQs
const getAllFAQs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const faqs = await FAQ.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await FAQ.countDocuments();

  successHandler(res, {
    faqs,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "FAQs retrieved successfully");
});

// Get FAQ by ID
const getFAQById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const faq = await FAQ.findById(id);

  if (!faq) {
    return next(new AppError("FAQ not found", 404));
  }

  successHandler(res, faq, "FAQ retrieved successfully");
});

// Update FAQ
const updateFAQ = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const faq = await FAQ.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!faq) {
    return next(new AppError("FAQ not found", 404));
  }

  successHandler(res, faq, "FAQ updated successfully");
});

// Delete FAQ
const deleteFAQ = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const faq = await FAQ.findByIdAndDelete(id);

  if (!faq) {
    return next(new AppError("FAQ not found", 404));
  }

  successHandler(res, null, "FAQ deleted successfully");
});

module.exports = {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ
};
