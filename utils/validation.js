const Joi = require("joi");
const { Types } = require("mongoose");

const validateMongoDbId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid MongoDB ObjectId");
  }
  return value;
};

// User validation schemas
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  designation: Joi.string().custom(validateMongoDbId).optional()
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('user', 'admin', 'superadmin').optional(),
  designation: Joi.string().custom(validateMongoDbId).optional(),
  isActive: Joi.boolean().optional()
});

// Service validation schemas
const createServiceSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
  status: Joi.string().valid('Active', 'Inactive').default('Active')
});

const updateServiceSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  status: Joi.string().valid('Active', 'Inactive').optional()
});

// SubService validation schemas
const createSubServiceSchema = Joi.object({
  image: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  serviceId: Joi.string().custom(validateMongoDbId).required()
});

const updateSubServiceSchema = Joi.object({
  image: Joi.string().optional(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  serviceId: Joi.string().custom(validateMongoDbId).optional()
});

// UserRole validation schemas
const routeShape = Joi.object({
  order: Joi.number().required(),
  title: Joi.string().required(),
  path: Joi.string().required(),
  permissions: Joi.array()
    .items(Joi.object().unknown(true))
    .optional()
    .default([])
});

const createUserRoleSchema = Joi.object({
  roleName: Joi.string().required(),
  routes: Joi.array().items(routeShape).optional(),
  status: Joi.boolean().optional()
});

const updateUserRoleSchema = Joi.object({
  roleName: Joi.string().optional(),
  routes: Joi.array().items(routeShape).optional(),
  status: Joi.boolean().optional(),
  totalRoutes: Joi.number().optional()
});

// AboutUs validation schemas
const createAboutUsSchema = Joi.object({
  description: Joi.string().required(),
  image: Joi.string().required()
});

const updateAboutUsSchema = Joi.object({
  description: Joi.string().optional(),
  image: Joi.string().optional()
});

// Advertisement validation schemas
const createAdvertisementSchema = Joi.object({
  title: Joi.string().required(),
  image: Joi.string().required(),
  status: Joi.string().valid('Active', 'Inactive').default('Active')
});

const updateAdvertisementSchema = Joi.object({
  title: Joi.string().optional(),
  image: Joi.string().optional(),
  status: Joi.string().valid('Active', 'Inactive').optional()
});

// FAQ validation schemas
const createFAQSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required()
});

const updateFAQSchema = Joi.object({
  title: Joi.string().optional(),
  body: Joi.string().optional()
});

// Opportunities validation schemas
const createOpportunitiesSchema = Joi.object({
  name: Joi.string().required(),
  opportunity: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required()
    })
  ).min(1).required(),
  status: Joi.string().valid('Active', 'Inactive').default('Active')
});

const updateOpportunitiesSchema = Joi.object({
  name: Joi.string().optional(),
  opportunity: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required()
    })
  ).optional(),
  status: Joi.string().valid('Active', 'Inactive').optional()
});

// OurStory validation schemas
const createOurStorySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required()
});

const updateOurStorySchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional()
});

// Work validation schemas
const createWorkSchema = Joi.object({
  workCategory: Joi.string().required(),
  serviceId: Joi.string().custom(validateMongoDbId).required(),
  subServiceIds: Joi.array().items(Joi.string().custom(validateMongoDbId)).optional(),
  works: Joi.array().items(
    Joi.object({
      image: Joi.string().required(),
      title: Joi.string().required(),
      url: Joi.string().required(),
      description: Joi.string().required()
    })
  ).min(1).required(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const updateWorkSchema = Joi.object({
  workCategory: Joi.string().optional(),
  serviceId: Joi.string().custom(validateMongoDbId).optional(),
  subServiceIds: Joi.array().items(Joi.string().custom(validateMongoDbId)).optional(),
  works: Joi.array().items(
    Joi.object({
      image: Joi.string().required(),
      title: Joi.string().required(),
      url: Joi.string().required(),
      description: Joi.string().required()
    })
  ).optional(),
  status: Joi.string().valid('active', 'inactive').optional()
});

// TeamMember validation schemas
const createTeamMemberSchema = Joi.object({
  role: Joi.string().custom(validateMongoDbId).required(),
  name: Joi.string().required(),
  shortDescription: Joi.string().required(),
  image: Joi.string().required(),
  url: Joi.array().items(
    Joi.object({
      siteName: Joi.string().required(),
      link: Joi.string().required()
    })
  ).optional()
});

const updateTeamMemberSchema = Joi.object({
  role: Joi.string().custom(validateMongoDbId).optional(),
  name: Joi.string().optional(),
  shortDescription: Joi.string().optional(),
  image: Joi.string().optional(),
  url: Joi.array().items(
    Joi.object({
      siteName: Joi.string().required(),
      link: Joi.string().required()
    })
  ).optional()
});

// TeamRole validation schemas
const createTeamRoleSchema = Joi.object({
  role: Joi.string().required(),
  description: Joi.string().required()
});

const updateTeamRoleSchema = Joi.object({
  role: Joi.string().optional(),
  description: Joi.string().optional()
});

// Review validation schemas
const createReviewSchema = Joi.object({
  userInfo: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    image: Joi.string().required()
  }).required(),
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

// Resources validation schemas
const createResourceSchema = Joi.object({
  title: Joi.string().required(),
  subTitle: Joi.string().optional(),
  shortDescription: Joi.string().optional(),
  longDescription: Joi.string().optional(),
  image: Joi.string().optional(),
  type: Joi.string().valid('blog', 'article', 'product').required()
});

const updateResourceSchema = Joi.object({
  title: Joi.string().optional(),
  subTitle: Joi.string().optional(),
  shortDescription: Joi.string().optional(),
  longDescription: Joi.string().optional(),
  image: Joi.string().optional(),
  type: Joi.string().valid('blog', 'article', 'product').optional()
});

// Events validation schemas
const createEventSchema = Joi.object({
  title: Joi.string().required(),
  subTitle: Joi.string().optional(),
  shortDescription: Joi.string().optional(),
  longDescription: Joi.string().optional(),
  image: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().required()
    })
  ).optional(),
  video: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().required()
    })
  ).optional(),
  location: Joi.string().optional(),
  type: Joi.string().valid('upcoming_event', 'archive_event').required()
});

// Proposal validation schemas
const createProposalSchema = Joi.object({
  fullname: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, "").optional(),
  company: Joi.string().allow(null, "").optional(),
  services: Joi.array()
    .items(Joi.string().custom(validateMongoDbId))
    .optional(),
  subServices: Joi.array()
    .items(Joi.string().custom(validateMongoDbId))
    .optional(),
  budget: Joi.string().allow(null, "").optional(),
  messages: Joi.string().allow(null, "").optional(),
  status: Joi.string()
    .valid("Pending", "Accepted", "Rejected", "In Progress", "Completed")
    .optional(),
  isActive: Joi.boolean().optional(),
});

const updateProposalSchema = Joi.object({
  fullname: Joi.string().min(3).max(120).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().allow(null, "").optional(),
  company: Joi.string().allow(null, "").optional(),
  services: Joi.array()
    .items(Joi.string().custom(validateMongoDbId))
    .optional(),
  subServices: Joi.array()
    .items(Joi.string().custom(validateMongoDbId))
    .optional(),
  budget: Joi.string().allow(null, "").optional(),
  messages: Joi.string().allow(null, "").optional(),
  status: Joi.string()
    .valid("Pending", "Accepted", "Rejected", "In Progress", "Completed")
    .optional(),
  isActive: Joi.boolean().optional(),
});

const updateProposalStatusSchema = Joi.object({
  status: Joi.string()
    .valid("Pending", "Accepted", "Rejected", "In Progress", "Completed")
    .required(),
});

// Phase validation schemas
const createPhaseSchema = Joi.object({
  title: Joi.string().min(2).max(150).required(),
  description: Joi.string().required(),
  proposalId: Joi.string().custom(validateMongoDbId).required(),
  images: Joi.array().items(Joi.string()).optional(),
});

const updatePhaseSchema = Joi.object({
  title: Joi.string().min(2).max(150).optional(),
  description: Joi.string().optional(),
  proposalId: Joi.string().custom(validateMongoDbId).optional(),
  images: Joi.array().items(Joi.string()).optional(),
});

// Common validation for MongoDB ObjectId
const mongoIdSchema = Joi.object({
  id: Joi.string().custom(validateMongoDbId).required()
});

module.exports = {
  validateMongoDbId,
  // User schemas
  createUserSchema,
  updateUserSchema,
  // Service schemas
  createServiceSchema,
  updateServiceSchema,
  // SubService schemas
  createSubServiceSchema,
  updateSubServiceSchema,
  // UserRole schemas
  createUserRoleSchema,
  updateUserRoleSchema,
  // AboutUs schemas
  createAboutUsSchema,
  updateAboutUsSchema,
  // Advertisement schemas
  createAdvertisementSchema,
  updateAdvertisementSchema,
  // FAQ schemas
  createFAQSchema,
  updateFAQSchema,
  // Opportunities schemas
  createOpportunitiesSchema,
  updateOpportunitiesSchema,
  // OurStory schemas
  createOurStorySchema,
  updateOurStorySchema,
  // Work schemas
  createWorkSchema,
  updateWorkSchema,
  // TeamMember schemas
  createTeamMemberSchema,
  updateTeamMemberSchema,
  // TeamRole schemas
  createTeamRoleSchema,
  updateTeamRoleSchema,
  // Review schemas
  createReviewSchema,
  // Resources schemas
  createResourceSchema,
  updateResourceSchema,
  // Events schemas
  createEventSchema,
  // Proposal schemas
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  // Phase schemas
  createPhaseSchema,
  updatePhaseSchema,
  // Common schemas
  mongoIdSchema
};
