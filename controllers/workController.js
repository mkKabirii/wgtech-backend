const Work = require("../model/workModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createWorkSchema } = require("../utils/validation");

// Create Work
const createWork = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createWorkSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { workCategory, categoryDescription, serviceId, subServiceIds, works, status  } = validatedData;

  const work = await Work.create({
    workCategory,
    categoryDescription,
    works,
    status
  });

  successHandler(res, work, "Work created successfully", 201);
});

// Get All Works
const getAllWorks = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, serviceId, workCategory, categoryDescription } = req.query;
  
  let filter = {};
  if (status) filter.status = "Active";
  if (serviceId) filter.serviceId = serviceId;
  if (workCategory) filter.workCategory = workCategory;
  if (categoryDescription) filter.categoryDescription = categoryDescription;
  const works = await Work.find(filter)
    .populate('serviceId', 'title description image')
    .populate('subServiceIds', 'title description image')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Work.countDocuments(filter);

  successHandler(res, {
    works,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "Works retrieved successfully");
});

// Get Work by ID
const getWorkById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const work = await Work.findById(id)
    .populate('serviceId', 'title description image')
    .populate('subServiceIds', 'title description image');

  if (!work) {
    return next(new AppError("Work not found", 404));
  }

  successHandler(res, work, "Work retrieved successfully");
});

// Update Work
const updateWork = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const work = await Work.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('serviceId', 'title description image')
    .populate('subServiceIds', 'title description image');

  if (!work) {
    return next(new AppError("Work not found", 404));
  }

  successHandler(res, work, "Work updated successfully");
});

// Delete Work
const deleteWork = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const work = await Work.findByIdAndDelete(id);

  if (!work) {
    return next(new AppError("Work not found", 404));
  }

  successHandler(res, null, "Work deleted successfully");
});

// Toggle Work Status
const toggleWorkStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const work = await Work.findById(id);
  if (!work) {
    return next(new AppError("Work not found", 404));
  }

  work.status = work.status === 'active' ? 'inactive' : 'active';
  await work.save();

  successHandler(res, work, `Work ${work.status} successfully`);
});

// Get Active Works
const getActiveWorks = catchAsync(async (req, res, next) => {
  const works = await Work.find({ status: 'active' })
    .populate('serviceId', 'title description image')
    .populate('subServiceIds', 'title description image')
    .sort({ createdAt: -1 });

  successHandler(res, works, "Active works retrieved successfully");
});

module.exports = {
  createWork,
  getAllWorks,
  getWorkById,
  updateWork,
  deleteWork,
  toggleWorkStatus,
  getActiveWorks
};
