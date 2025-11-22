const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createResource,
  getAllResources,
  getResourceById,
  getBlogs,
  getBlogById,
  getArticles,
  getProducts,
  getArticleById,
  getProductById,
  updateResource,
  deleteResource
} = require("../controllers/resourcesController");

const router = express.Router();

// Routes
router.post("/", protect, createResource);
router.get("/", getAllResources);
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.get("/articles", getArticles);
router.get("/articles/:id", getArticleById);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
  router.get("/:id", getResourceById);
router.put("/:id", protect, updateResource);
router.delete("/:id", protect, deleteResource);

module.exports = router;

