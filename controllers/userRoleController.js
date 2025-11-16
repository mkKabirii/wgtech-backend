const UserRole = require("../model/userRole");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createUserRoleSchema } = require("../utils/validation");

// Create UserRole
const createUserRole = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createUserRoleSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const { roleName, routes = [], status = true } = validatedData;

  // Check if role already exists
  const existingRole = await UserRole.findOne({ roleName });
  if (existingRole) {
    return next(new AppError("Role with this name already exists", 400));
  }

  const userRole = await UserRole.create({
    roleName,
    routes,
    status,
    totalRoutes: routes.length
  });

  successHandler(res, userRole, "UserRole created successfully", 201);
});

// Get All UserRoles
const getAllUserRoles = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const userRoles = await UserRole.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await UserRole.countDocuments();

  successHandler(res, {
    userRoles,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  }, "UserRoles retrieved successfully");
});

// Get UserRole by ID
const getUserRoleById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userRole = await UserRole.findById(id);

  if (!userRole) {
    return next(new AppError("UserRole not found", 404));
  }

  successHandler(res, userRole, "UserRole retrieved successfully");
});

// Update UserRole
const updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  // If roleName is being updated, check if another role with same name exists
  if (updateData.roleName) {
    const existingRole = await UserRole.findOne({ 
      roleName: updateData.roleName, 
      _id: { $ne: id } 
    });
    if (existingRole) {
      return next(new AppError("Role with this name already exists", 400));
    }
  }

  if (updateData.routes) {
    updateData.totalRoutes = updateData.routes.length;
  }

  const userRole = await UserRole.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!userRole) {
    return next(new AppError("UserRole not found", 404));
  }

  successHandler(res, userRole, "UserRole updated successfully");
});

// Delete UserRole
const deleteUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userRole = await UserRole.findByIdAndDelete(id);

  if (!userRole) {
    return next(new AppError("UserRole not found", 404));
  }

  successHandler(res, null, "UserRole deleted successfully");
});

// Add Page to UserRole
const addPageToUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    order,
    title,
    path,
    permissions = []
  } = req.body;

  const userRole = await UserRole.findById(id);
  if (!userRole) {
    return next(new AppError("UserRole not found", 404));
  }

  // Check if page already exists
  const existingPage = userRole.routes.find(
    page => page.path === path
  );
  if (existingPage) {
    return next(new AppError("Page with this route already exists", 400));
  }

  userRole.routes.push({ title, path, order, permissions });
  userRole.totalRoutes = userRole.routes.length;
  await userRole.save();

  successHandler(res, userRole, "Page added to UserRole successfully");
});

// Remove Page from UserRole
const removePageFromUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { path } = req.body;

  const userRole = await UserRole.findById(id);
  if (!userRole) {
    return next(new AppError("UserRole not found", 404));
  }

  const pageIndex = userRole.routes.findIndex(
    page => page.path === path
  );
  
  if (pageIndex === -1) {
    return next(new AppError("Page not found in this role", 404));
  }

  userRole.routes.splice(pageIndex, 1);
  userRole.totalRoutes = userRole.routes.length;
  await userRole.save();

  successHandler(res, userRole, "Page removed from UserRole successfully");
});

module.exports = {
  createUserRole,
  getAllUserRoles,
  getUserRoleById,
  updateUserRole,
  deleteUserRole,
  addPageToUserRole,
  removePageFromUserRole
};
