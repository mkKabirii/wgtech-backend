const Opportunities = require("../model/opportunitiesModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createOpportunitiesSchema } = require("../utils/validation");

// Create Opportunities
const createOpportunities = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createOpportunitiesSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { name, opportunity, status } = validatedData;

  const opportunities = await Opportunities.create({
    name,
    opportunity,
    status
  });

  successHandler(res, opportunities, "Opportunities created successfully", 201);
});

// Get All Opportunities
const getAllOpportunities = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  
  let filter = {};
  if (status) filter.status = status;

  const opportunities = await Opportunities.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Opportunities.countDocuments(filter);

  successHandler(res, {
    opportunities,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "Opportunities retrieved successfully");
});


const getAllOpportunitiesWithoutPagination = catchAsync(async (req, res, next) => {
  const { status } = req.query;

  let filter = {};
  if (status) filter.status = status;

  const opportunities = await Opportunities.find(filter).sort({ createdAt: -1 });

  successHandler(
    res,
    {
      opportunities,
      total: opportunities.length,
    },
    "All opportunities retrieved successfully"
  );
});


// Get Opportunities by ID
const getOpportunitiesById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const opportunities = await Opportunities.findById(id);

  if (!opportunities) {
    return next(new AppError("Opportunities not found", 404));
  }

  successHandler(res, opportunities, "Opportunities retrieved successfully");
});

// Update Opportunities
const updateOpportunities = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const opportunities = await Opportunities.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!opportunities) {
    return next(new AppError("Opportunities not found", 404));
  }

  successHandler(res, opportunities, "Opportunities updated successfully");
});

// Delete Opportunities
const deleteOpportunities = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const opportunities = await Opportunities.findByIdAndDelete(id);

  if (!opportunities) {
    return next(new AppError("Opportunities not found", 404));
  }

  successHandler(res, null, "Opportunities deleted successfully");
});

// Toggle Opportunities Status
const toggleOpportunitiesStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const opportunities = await Opportunities.findById(id);
  if (!opportunities) {
    return next(new AppError("Opportunities not found", 404));
  }

  opportunities.status = opportunities.status === 'Active' ? 'Inactive' : 'Active';
  await opportunities.save();

  successHandler(res, opportunities, `Opportunities ${opportunities.status} successfully`);
});

// Get Active Opportunities
const getActiveOpportunities = catchAsync(async (req, res, next) => {
  const opportunities = await Opportunities.find({ status: 'Active' })
    .sort({ createdAt: -1 });

  successHandler(res, opportunities, "Active opportunities retrieved successfully");
});

module.exports = {
  createOpportunities,
  getAllOpportunities,
  getOpportunitiesById,
  updateOpportunities,
  deleteOpportunities,
  toggleOpportunitiesStatus,
  getActiveOpportunities,
  getAllOpportunitiesWithoutPagination  
};
