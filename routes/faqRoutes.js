const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ
} = require("../controllers/faqController");

const router = express.Router();

// Routes
router.post("/", protect, createFAQ);
router.get("/", getAllFAQs);
router.get("/:id", getFAQById);
router.put("/:id", protect, updateFAQ);
router.delete("/:id", protect, deleteFAQ);

module.exports = router;
