const Proposal = require("../model/proposalsModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
// demo add email
const EmailService = require("../utils/emailService");

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

//add here new one replace older save in sticknotes:
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

  // ✅ AUTO USER ACCOUNT CREATE
  try {
    const User = require("../model/userModel");
    const bcrypt = require("bcryptjs");

    const existingUser = await User.findOne({ email: validatedData.email });

    if (!existingUser && validatedData.password) {
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      await User.create({
        fullname: validatedData.fullname,
        username: validatedData.fullname,
        email: validatedData.email,
        password: hashedPassword,
        nationalId: validatedData.nationalId || null,
      });

      console.log("✅ User account created for:", validatedData.email);
    }
  } catch (userError) {
    console.error("❌ User creation failed:", userError.message);
  }

  // ✅ Email Send (Custom Template / Default Template)
  try {
    const Settings = require("../model/settingsModal");
    const settings = await Settings.findOne();
    
    const emailService = new EmailService(proposal.email);
    const senderEmail = settings?.senderEmail || null;

    // Custom HTML Template
    if (settings?.proposalEmailTemplate) {
      const compiledHtml = settings.proposalEmailTemplate
        .replace(/{{fullname}}/g, proposal.fullname)
        .replace(/{{email}}/g, proposal.email)
        .replace(/{{budget}}/g, proposal.budget || "Not specified")
        .replace(/{{password}}/g, validatedData.password || "N/A")
        .replace(/{{adminLink}}/g, process.env.ADMIN_PANEL_URL || "http://localhost:5173");

      await emailService.send({
        subject: "✅ Proposal Received - WG Tech Solutions",
        message: compiledHtml,
        senderEmail, // ✅ Added sender email
      });
    } 
    // Default Template
    else {
      await emailService.send({
        subject: "✅ Proposal Received - WG Tech Solutions",
        template: "proposalConfirmation",
        templateData: {
          fullname: proposal.fullname,
          email: proposal.email,
          budget: proposal.budget || "Not specified",
          password: validatedData.password || "N/A",
          adminLink: process.env.ADMIN_PANEL_URL || "http://localhost:5173",
        },
        senderEmail, // ✅ Added sender email

      });
    }

  } catch (emailError) {
    console.error("📧 Email send failed:", emailError.message);
  }

  successHandler(res, proposal, "Proposal created successfully", 201);
});



//     // ✅ Email bhejo add kia ha?
//   try {
//     const emailService = new EmailService(proposal.email);
//     await emailService.send({
//       subject: "✅ Proposal Received - WG Tech Solutions",
//       template: "proposalConfirmation",
//       templateData: {
//         fullname: proposal.fullname,
//         email: proposal.email,
//         budget: proposal.budget || "Not specified",
//         password: validatedData.password || "N/A", // ✅ FIX
//         // adminLink: "https://admin.wgtecsol.com",
//         adminLink: process.env.ADMIN_PANEL_URL || "http://localhost:5173", // ✅
//       },
//     });
//   } catch (emailError) {
//     console.error("📧 Email send failed:", emailError.message);
//   }

//   successHandler(res, proposal, "Proposal created successfully", 201);
// });


//add new here
const sendProposalEmail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  const proposal = await Proposal.findById(id);
  if (!proposal) return next(new AppError("Proposal not found", 404));

  const Settings = require("../model/settingsModal");
  const settings = await Settings.findOne();
  const targetEmail = email || proposal.email;
  const emailService = new EmailService(targetEmail);
  const senderEmail = settings?.senderEmail || null;


  if (settings?.proposalEmailTemplate) {
    const compiledHtml = settings.proposalEmailTemplate
      .replace(/{{fullname}}/g, proposal.fullname)
      .replace(/{{email}}/g, targetEmail)
      .replace(/{{budget}}/g, proposal.budget || "Not specified")
      .replace(/{{adminLink}}/g, process.env.ADMIN_PANEL_URL || "http://localhost:5173");

    await emailService.send({
      subject: "✅ Proposal Received - WG Tech Solutions",
      message: compiledHtml,
      senderEmail, // ✅ Added sender email

    });
  } else {
    await emailService.send({
      subject: "✅ Proposal Received - WG Tech Solutions",
      template: "proposalConfirmation",
      templateData: {
        fullname: proposal.fullname,
        email: targetEmail,
        budget: proposal.budget || "Not specified",
        password: "Check your registration email",
        adminLink: process.env.ADMIN_PANEL_URL || "http://localhost:5173",
      },
        senderEmail, // ✅ Added sender email
    });
  }

  successHandler(res, null, "Email sent successfully");
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
  sendProposalEmail,  // ✅ YEH HAI?


};

