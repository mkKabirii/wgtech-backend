const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createSettings,
  getSettings,
  updateSettings
} = require("../controllers/settingsController");

const router = express.Router();

// Routes
router.post("/", protect, createSettings);
router.get("/", getSettings);
router.put("/", protect, updateSettings);

module.exports = router;

