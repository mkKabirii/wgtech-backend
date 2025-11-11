const Proposal = require("../model/proposalsModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const {
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  mongoIdSchema,
} = require("../utils/validation");

const generateUniqueProposalId = async () => {
  let proposalId;
  let isUnique = false;

  while (!isUnique) {
    proposalId = Math.floor(100000 + Math.random() * 900000);
    const existingProposal = await Proposal.findOne({ proposalId });
    if (!existingProposal) {
      isUnique = true;
    }
  }

  return proposalId;
};

const createProposal = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createProposalSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const proposalId = await generateUniqueProposalId();

  const proposal = await Proposal.create({
    ...validatedData,
    proposalId,
  });

  successHandler(res, proposal, "Proposal created successfully", 201);
});

const getAllProposals = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, isActive, search } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (typeof isActive !== "undefined") {
    filter.isActive =
      typeof isActive === "string" ? isActive === "true" : Boolean(isActive);
  }

  if (search) {
    filter.$or = [
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  const proposals = await Proposal.find(filter)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  const total = await Proposal.countDocuments(filter);

  successHandler(
    res,
    {
      proposals,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    },
    "Proposals retrieved successfully"
  );
});

const getProposalById = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  successHandler(res, proposal, "Proposal retrieved successfully");
});

const updateProposal = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const [error, validatedData] = schemaValidator(
    req.body,
    updateProposalSchema
  );
  if (error) {
    return next(new AppError(error, 400));
  }

  const proposal = await Proposal.findByIdAndUpdate(id, validatedData, {
    new: true,
    runValidators: true,
  });

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  successHandler(res, proposal, "Proposal updated successfully");
});

const updateProposalStatus = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const [error, validatedData] = schemaValidator(
    req.body,
    updateProposalStatusSchema
  );
  if (error) {
    return next(new AppError(error, 400));
  }

  const proposal = await Proposal.findByIdAndUpdate(
    id,
    { status: validatedData.status },
    { new: true, runValidators: true }
  );

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  successHandler(res, proposal, "Proposal status updated successfully");
});

const deleteProposal = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const proposal = await Proposal.findByIdAndDelete(id);

  if (!proposal) {
    return next(new AppError("Proposal not found", 404));
  }

  successHandler(res, null, "Proposal deleted successfully");
});

module.exports = {
  createProposal,
  getAllProposals,
  getProposalById,
  updateProposal,
  updateProposalStatus,
  deleteProposal,
};

