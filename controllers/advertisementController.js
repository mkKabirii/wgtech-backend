const Advertisement = require("../model/advertisementModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createAdvertisementSchema } = require("../utils/validation");

// Create Advertisement
const createAdvertisement = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createAdvertisementSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { title, image, status } = validatedData;

  const advertisement = await Advertisement.create({
    title,
    image,
    status
  });

  successHandler(res, advertisement, "Advertisement created successfully", 201);
});

// Get All Advertisements
const getAllAdvertisements = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  
  let filter = {};
  if (status) filter.status = status;

  const advertisements = await Advertisement.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Advertisement.countDocuments(filter);

  successHandler(res, {
    advertisements,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "Advertisements retrieved successfully");
});

// Get Advertisement by ID
const getAdvertisementById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    return next(new AppError("Advertisement not found", 404));
  }

  successHandler(res, advertisement, "Advertisement retrieved successfully");
});

// Update Advertisement
const updateAdvertisement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const advertisement = await Advertisement.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!advertisement) {
    return next(new AppError("Advertisement not found", 404));
  }

  successHandler(res, advertisement, "Advertisement updated successfully");
});

// Delete Advertisement
const deleteAdvertisement = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const advertisement = await Advertisement.findByIdAndDelete(id);

  if (!advertisement) {
    return next(new AppError("Advertisement not found", 404));
  }

  successHandler(res, null, "Advertisement deleted successfully");
});

// Toggle Advertisement Status
const toggleAdvertisementStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const advertisement = await Advertisement.findById(id);
  if (!advertisement) {
    return next(new AppError("Advertisement not found", 404));
  }

  advertisement.status = advertisement.status === 'Active' ? 'Inactive' : 'Active';
  await advertisement.save();

  successHandler(res, advertisement, `Advertisement ${advertisement.status} successfully`);
});

// Get Active Advertisements
const getActiveAdvertisements = catchAsync(async (req, res, next) => {
  const advertisements = await Advertisement.find({ status: 'Active' })
    .sort({ createdAt: -1 });

  successHandler(res, advertisements, "Active advertisements retrieved successfully");
});

module.exports = {
  createAdvertisement,
  getAllAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  toggleAdvertisementStatus,
  getActiveAdvertisements
};
