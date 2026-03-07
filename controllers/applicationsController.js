const Applications = require("../model/applicationsModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const {
  createApplicationSchema,
  updateApplicationSchema,
  updateApplicationStatusSchema,
  mongoIdSchema,
} = require("../utils/validation");

// Create Application
const createApplication = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(
    req.body,
    createApplicationSchema
  );
  if (error) {
    return next(new AppError(error, 400));
  }

  const application = await Applications.create(validatedData);

  // createApplication function mein — application create ke baad add karo:
try {
  const Settings = require("../model/settingsModal");
  const EmailService = require("../utils/emailService");
  const settings = await Settings.findOne();
  const emailService = new EmailService(application.email);

  if (settings?.applicationEmailTemplate) {
    const compiledHtml = settings.applicationEmailTemplate
      .replace(/{{fullname}}/g, `${application.firstName} ${application.lastName}`)
      .replace(/{{email}}/g, application.email)
      .replace(/{{position}}/g, application.jobTitle || "General Application");

    await emailService.send({
      subject: "✅ Application Received - WG Tech Solutions",
      message: compiledHtml,
    });
  } else {
    await emailService.send({
      subject: "✅ Application Received - WG Tech Solutions",
      template: "applicationConfirmation",
      templateData: {
        fullname: `${application.firstName} ${application.lastName}`,
        email: application.email,
        position: application.jobTitle || "General Application",
      },
    });
  }
} catch (emailError) {
  console.error("📧 Email send failed:", emailError.message);
}

    // ✅ Email bhejo application for add kia ha?
  // try {
  //   const EmailService = require("../utils/emailService");
  //   const emailService = new EmailService(application.email);
  //   await emailService.send({
  //     subject: "✅ Application Received - WG Tech Solutions",
  //     template: "applicationConfirmation",
  //     templateData: {
  //       fullname: application.firstName + " " + application.lastName,
  //       email: application.email,
  //       position: application.jobTitle || "General Application",
  //     },
  //   });
  // } catch (emailError) {
  //   console.error("📧 Email send failed:", emailError.message);
  // }

  successHandler(
    res,
    application,
    "Application created successfully",
    201
  );
});

// Get All Applications
const getAllApplications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, isActive, search } = req.query;

  let filter = {};

  if (status) {
    filter.status = status;
  }

  if (typeof isActive !== "undefined") {
    filter.isActive =
      typeof isActive === "string" ? isActive === "true" : Boolean(isActive);
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
      { "phone.phoneNumber": { $regex: search, $options: "i" } },
    ];
  }

  const applications = await Applications.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Applications.countDocuments(filter);

  successHandler(
    res,
    {
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Applications retrieved successfully"
  );
});

// Get Application by ID
const getApplicationById = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const application = await Applications.findById(id);

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  successHandler(res, application, "Application retrieved successfully");
});

// Update Application
const updateApplication = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const [error, validatedData] = schemaValidator(
    req.body,
    updateApplicationSchema
  );
  if (error) {
    return next(new AppError(error, 400));
  }

  const application = await Applications.findByIdAndUpdate(
    id,
    validatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  successHandler(res, application, "Application updated successfully");
});

// Update Application Status
const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const [error, validatedData] = schemaValidator(
    req.body,
    updateApplicationStatusSchema
  );
  if (error) {
    return next(new AppError(error, 400));
  }

  const application = await Applications.findByIdAndUpdate(
    id,
    { status: validatedData.status },
    { new: true, runValidators: true }
  );

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  successHandler(
    res,
    application,
    "Application status updated successfully"
  );
});

// Delete Application
const deleteApplication = catchAsync(async (req, res, next) => {
  const [paramError, { id }] = schemaValidator(req.params, mongoIdSchema);
  if (paramError) {
    return next(new AppError(paramError, 400));
  }

  const application = await Applications.findByIdAndDelete(id);

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  successHandler(res, null, "Application deleted successfully");
});

// Get Applications by Status
const getApplicationsByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const validStatuses = ["pending", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const applications = await Applications.find({ status })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Applications.countDocuments({ status });

  successHandler(
    res,
    {
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    `${status} applications retrieved successfully`
  );
});

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationsByStatus,
};

