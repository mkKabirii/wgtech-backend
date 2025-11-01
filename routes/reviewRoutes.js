const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleReviewStatus,
  getActiveReviews
} = require("../controllers/reviewController");

const router = express.Router();

// Routes
router.post("/", protect, createReview);
router.get("/", getAllReviews);
router.get("/active", getActiveReviews);
router.get("/:id", getReviewById);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.patch("/:id/toggle-status", protect, toggleReviewStatus);

module.exports = router;
