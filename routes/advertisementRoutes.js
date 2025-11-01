const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createAdvertisement,
  getAllAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  toggleAdvertisementStatus,
  getActiveAdvertisements
} = require("../controllers/advertisementController");

const router = express.Router();

// Routes
router.post("/", protect, createAdvertisement);
router.get("/", getAllAdvertisements);
router.get("/active", getActiveAdvertisements);
router.get("/:id", getAdvertisementById);
router.put("/:id", protect, updateAdvertisement);
router.delete("/:id", protect, deleteAdvertisement);
router.patch("/:id/toggle-status", protect, toggleAdvertisementStatus);

module.exports = router;
