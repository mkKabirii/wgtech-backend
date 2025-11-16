const TeamMember = require("../model/ourTeamModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createTeamMemberSchema } = require("../utils/validation");

// Create Team Member
const createTeamMember = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createTeamMemberSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { role, name, shortDescription, url , image} = validatedData;

  const teamMember = await TeamMember.create({
    role,
    name,
    shortDescription,
    url,
    image
  });

  successHandler(res, teamMember, "Team member created successfully", 201);
});

// Get All Team Members
const getAllTeamMembers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, role } = req.query;
  
  let filter = {};
  if (role) filter.role = role;

  const teamMembers = await TeamMember.find(filter)
    .populate('role', 'role description')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await TeamMember.countDocuments(filter);

  successHandler(res, {
    teamMembers,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "Team members retrieved successfully");
});

// Get Team Member by ID
const getTeamMemberById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const teamMember = await TeamMember.findById(id)
    .populate('role', 'role description');

  if (!teamMember) {
    return next(new AppError("Team member not found", 404));
  }

  successHandler(res, teamMember, "Team member retrieved successfully");
});

// Update Team Member
const updateTeamMember = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const teamMember = await TeamMember.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('role', 'role description');

  if (!teamMember) {
    return next(new AppError("Team member not found", 404));
  }

  successHandler(res, teamMember, "Team member updated successfully");
});

// Delete Team Member
const deleteTeamMember = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const teamMember = await TeamMember.findByIdAndDelete(id);

  if (!teamMember) {
    return next(new AppError("Team member not found", 404));
  }

  successHandler(res, null, "Team member deleted successfully");
});

module.exports = {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember
};
