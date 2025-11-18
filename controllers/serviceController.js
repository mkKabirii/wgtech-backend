const Service = require("../model/serviceModel");
const SubService = require("../model/subServiceModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createServiceSchema } = require("../utils/validation");

// Create Service
const createService = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createServiceSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { title, description, image, status } = validatedData;

  const service = await Service.create({
    title,
    description,
    image,
    status
  });

  successHandler(res, service, "Service created successfully", 201);
});

// Get All Services
const getAllServices = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  
  let filter = {};
  if (status) filter.status = status;

  const services = await Service.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Service.countDocuments(filter);

  successHandler(res, {
    services,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "Services retrieved successfully");
});

// Get Service by ID
const getServiceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const service = await Service.findById(id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  successHandler(res, service, "Service retrieved successfully");
});

// Update Service
const updateService = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const service = await Service.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  successHandler(res, service, "Service updated successfully");
});

// Delete Service
const deleteService = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const service = await Service.findByIdAndDelete(id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  successHandler(res, null, "Service deleted successfully");
});

// Toggle Service Status
const toggleServiceStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  service.status = service.status === 'Active' ? 'Inactive' : 'Active';
  await service.save();

  successHandler(res, service, `Service ${service.status} successfully`);
});

// Get Active Services
const getActiveServices = catchAsync(async (req, res, next) => {
  const services = await Service.find({ status: 'Active' })
    .sort({ createdAt: -1 });

  successHandler(res, services, "Active services retrieved successfully");
});

// Get All Services with their Sub-Services (Only Active by default)
const getServiceandItsSubservicesAll = catchAsync(async (req, res, next) => {
  // By default only Active services
  const filter = { status: 'Active' };

  // Get all active services
  const services = await Service.find(filter)
    .sort({ createdAt: -1 });

  // Get all sub-services grouped by serviceId
  const subServices = await SubService.find({})
    .sort({ createdAt: -1 });

  // Map services with their sub-services
  const servicesWithSubServices = services.map(service => {
    const serviceObj = service.toObject();
    serviceObj.subServices = subServices.filter(
      subService => subService.serviceId.toString() === service._id.toString()
    );
    return serviceObj;
  });

  successHandler(res, servicesWithSubServices, "Services with sub-services retrieved successfully");
});

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
  getActiveServices,
  getServiceandItsSubservicesAll
};
