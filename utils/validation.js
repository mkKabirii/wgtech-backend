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
  role: Joi.string().valid('user', 'admin', 'superadmin').default('user'),
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
const createUserRoleSchema = Joi.object({
  roleName: Joi.string().required(),
  assignedPages: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      route: Joi.string().required()
    })
  ).min(1).required()
});

const updateUserRoleSchema = Joi.object({
  roleName: Joi.string().optional(),
  assignedPages: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      route: Joi.string().required()
    })
  ).optional()
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
  // Common schemas
  mongoIdSchema
};
