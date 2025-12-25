const TeamRole = require("../model/teamRoleModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createTeamRoleSchema } = require("../utils/validation");

// Create Team Role
const createTeamRole = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createTeamRoleSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { role } = validatedData;

  const teamRole = await TeamRole.create({
    role,

  });

  successHandler(res, teamRole, "Team role created successfully", 201);
});

// Get All Team Roles
const getAllTeamRoles = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const teamRoles = await TeamRole.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await TeamRole.countDocuments();

  successHandler(res, {
    teamRoles,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "Team roles retrieved successfully");
});

// Get Team Role by ID
const getTeamRoleById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const teamRole = await TeamRole.findById(id);

  if (!teamRole) {
    return next(new AppError("Team role not found", 404));
  }

  successHandler(res, teamRole, "Team role retrieved successfully");
});

// Update Team Role
const updateTeamRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const teamRole = await TeamRole.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!teamRole) {
    return next(new AppError("Team role not found", 404));
  }

  successHandler(res, teamRole, "Team role updated successfully");
});

// Delete Team Role
const deleteTeamRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const teamRole = await TeamRole.findByIdAndDelete(id);

  if (!teamRole) {
    return next(new AppError("Team role not found", 404));
  }

  successHandler(res, null, "Team role deleted successfully");
});

module.exports = {
  createTeamRole,
  getAllTeamRoles,
  getTeamRoleById,
  updateTeamRole,
  deleteTeamRole
};
