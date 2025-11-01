const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createWork,
  getAllWorks,
  getWorkById,
  updateWork,
  deleteWork,
  toggleWorkStatus,
  getActiveWorks
} = require("../controllers/workController");

const router = express.Router();

// Routes
router.post("/", protect, createWork);
router.get("/", getAllWorks);
router.get("/active", getActiveWorks);
router.get("/:id", getWorkById);
router.put("/:id", protect, updateWork);
router.delete("/:id", protect, deleteWork);
router.patch("/:id/toggle-status", protect, toggleWorkStatus);

module.exports = router;
