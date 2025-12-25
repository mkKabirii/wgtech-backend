const Resources = require("../model/resourcesModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createResourceSchema } = require("../utils/validation");

// Create Resource
const createResource = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(
    req.body,
    createResourceSchema
  );
  if (error) {
    return next(new AppError(error, 400));
  }

  const {
    title,
    subTitle,
    shortDescription,
    longDescription,
    image,
    productImages,
    productLink,
    type,
    postedOn,
  } = validatedData;

  const resource = await Resources.create({
    title,
    subTitle,
    shortDescription,
    longDescription,
    image,
    productImages,
    productLink,
    type,
    postedOn,
  });

  successHandler(res, resource, "Resource created successfully", 201);
});

// Get All Resources
const getAllResources = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type } = req.query;

  let filter = {};
  if (type) filter.type = type;

  const resources = await Resources.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Resources.countDocuments(filter);

  successHandler(
    res,
    {
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Resources retrieved successfully"
  );
});

// Get Resource by ID
const getResourceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const resource = await Resources.findById(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  successHandler(res, resource, "Resource retrieved successfully");
});

// Get Blogs (type === "blog")
const getBlogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const blogs = await Resources.find({ type: "blog" })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Resources.countDocuments({ type: "blog" });

  successHandler(
    res,
    {
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Blogs retrieved successfully"
  );
});

const getBlogById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const blog = await Resources.findById({ type: "blog", _id: id });
  successHandler(res, blog, "Blog retrieved successfully");
});

// Get Articles (type === "article")
const getArticles = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const articles = await Resources.find({ type: "article" })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Resources.countDocuments({ type: "article" });

  successHandler(
    res,
    {
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Articles retrieved successfully"
  );
});

const getArticleById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Resources.findById({ type: "article", _id: id });
  successHandler(res, article, "Article retrieved successfully");
});

// Get Products (type === "product")
const getProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const products = await Resources.find({ type: "product" })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Resources.countDocuments({ type: "product" });

  successHandler(
    res,
    {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Products retrieved successfully"
  );
});

const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Resources.findById({ type: "product", _id: id });
  successHandler(res, product, "Product retrieved successfully");
});

// Update Resource
const updateResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const resource = await Resources.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  successHandler(res, resource, "Resource updated successfully");
});

// Delete Resource
const deleteResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const resource = await Resources.findByIdAndDelete(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  successHandler(res, null, "Resource deleted successfully");
});

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  getBlogs,
  getBlogById,
  getArticles,
  getProducts,
  getProductById,
  getArticleById,
  updateResource,
  deleteResource,
};
