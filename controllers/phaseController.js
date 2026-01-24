const Phase = require("../model/phaseModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const {
  createPhaseSchema,
  updatePhaseSchema,
  mongoIdSchema,
} = require("../utils/validation");

const createPhase = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createPhaseSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const phase = await Phase.create(validatedData);

  successHandler(res, phase, "Phase created successfully", 201);
});

const getAllPhases = catchAsync(async (req, res) => {
  const { proposalId, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (proposalId) {
    filter.proposalId = proposalId;
  }

  const phases = await Phase.find(filter)
    .populate("proposalId", "proposalId fullname email") 
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });


  const total = await Phase.countDocuments(filter);

  successHandler(
    res,
    {
      phases,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    },
    "Phases retrieved successfully"
  );
});

const getPhaseById = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const phase = await Phase.findById(id);

  if (!phase) {
    return next(new AppError("Phase not found", 404));
  }

  successHandler(res, phase, "Phase retrieved successfully");
});

const updatePhase = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const [error, validatedData] = schemaValidator(req.body, updatePhaseSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const phase = await Phase.findByIdAndUpdate(id, validatedData, {
    new: true,
    runValidators: true,
  });

  if (!phase) {
    return next(new AppError("Phase not found", 404));
  }

  successHandler(res, phase, "Phase updated successfully");
});

const deletePhase = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const phase = await Phase.findByIdAndDelete(id);

  if (!phase) {
    return next(new AppError("Phase not found", 404));
  }

  successHandler(res, null, "Phase deleted successfully");
});

const getPhaseByProposalId = catchAsync(async (req, res, next) => {
  const { proposalId } = req.params;
  const phases = await Phase.find({ proposalId }).populate("proposalId", "proposalId");
  if (!phases) {
    return next(new AppError("Phases not found", 404));
  }
  successHandler(res, phases, "Phases retrieved successfully");
});

module.exports = {
  createPhase,
  getAllPhases,
  getPhaseById,
  updatePhase,
  deletePhase,
  getPhaseByProposalId,
};
