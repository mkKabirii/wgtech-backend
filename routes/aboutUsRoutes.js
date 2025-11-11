const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createAboutUs,
  getAllAboutUs,
  getAboutUsById,
  updateAboutUs,
  deleteAboutUs,
  getAllAboutUsofWeb
} = require("../controllers/aboutUsController");

const router = express.Router();

// Routes
router.get("/web", getAllAboutUsofWeb);

router.post("/", protect, createAboutUs);
router.get("/", getAllAboutUs);
router.get("/:id", getAboutUsById);
router.put("/:id", protect, updateAboutUs);
router.delete("/:id", protect, deleteAboutUs);

module.exports = router;
