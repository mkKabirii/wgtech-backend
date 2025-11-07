const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createResource,
  getAllResources,
  getResourceById,
  getBlogs,
  getArticles,
  getProducts,
  updateResource,
  deleteResource
} = require("../controllers/resourcesController");

const router = express.Router();

// Routes
router.post("/", protect, createResource);
router.get("/", getAllResources);
router.get("/blogs", getBlogs);
router.get("/articles", getArticles);
router.get("/products", getProducts);
router.get("/:id", getResourceById);
router.put("/:id", protect, updateResource);
router.delete("/:id", protect, deleteResource);

module.exports = router;

