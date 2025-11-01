const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createOpportunities,
  getAllOpportunities,
  getOpportunitiesById,
  updateOpportunities,
  deleteOpportunities,
  toggleOpportunitiesStatus,
  getActiveOpportunities
} = require("../controllers/opportunitiesController");

const router = express.Router();

// Routes
router.post("/", protect, createOpportunities);
router.get("/", getAllOpportunities);
router.get("/active", getActiveOpportunities);
router.get("/:id", getOpportunitiesById);
router.put("/:id", protect, updateOpportunities);
router.delete("/:id", protect, deleteOpportunities);
router.patch("/:id/toggle-status", protect, toggleOpportunitiesStatus);

module.exports = router;
