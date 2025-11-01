const SubService = require("../model/subServiceModel");
const Service = require("../model/serviceModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createSubServiceSchema } = require("../utils/validation");

// Create SubService
const createSubService = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createSubServiceSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { image, title, description, serviceId } = validatedData;

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  const subService = await SubService.create({
    image,
    title,
    description,
    serviceId
  });

  // Populate service details
  await subService.populate('serviceId', 'title description status');

  successHandler(res, subService, "SubService created successfully", 201);
});

// Get All SubServices
const getAllSubServices = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, serviceId } = req.query;
  
  let filter = {};
  if (serviceId) filter.serviceId = serviceId;

  const subServices = await SubService.find(filter)
    .populate('serviceId', 'title description status')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await SubService.countDocuments(filter);

  successHandler(res, {
    subServices,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "SubServices retrieved successfully");
});

// Get SubService by ID
const getSubServiceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const subService = await SubService.findById(id)
    .populate('serviceId', 'title description status');

  if (!subService) {
    return next(new AppError("SubService not found", 404));
  }

  successHandler(res, subService, "SubService retrieved successfully");
});

// Update SubService
const updateSubService = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  // If serviceId is being updated, check if service exists
  if (updateData.serviceId) {
    const service = await Service.findById(updateData.serviceId);
    if (!service) {
      return next(new AppError("Service not found", 404));
    }
  }

  const subService = await SubService.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('serviceId', 'title description status');

  if (!subService) {
    return next(new AppError("SubService not found", 404));
  }

  successHandler(res, subService, "SubService updated successfully");
});

// Delete SubService
const deleteSubService = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const subService = await SubService.findByIdAndDelete(id);

  if (!subService) {
    return next(new AppError("SubService not found", 404));
  }

  successHandler(res, null, "SubService deleted successfully");
});

// Get SubServices by Service ID
const getSubServicesByServiceId = catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  const subServices = await SubService.find({ serviceId })
    .populate('serviceId', 'title description status')
    .sort({ createdAt: -1 });

  successHandler(res, subServices, "SubServices retrieved successfully");
});

module.exports = {
  createSubService,
  getAllSubServices,
  getSubServiceById,
  updateSubService,
  deleteSubService,
  getSubServicesByServiceId
};
