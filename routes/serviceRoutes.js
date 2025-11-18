const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
  getActiveServices,
  getServiceandItsSubservicesAll
} = require("../controllers/serviceController");

const router = express.Router();

// Routes
router.post("/", protect, createService);
router.get("/", getAllServices);
router.get("/active", getActiveServices);
router.get("/with-subservices", getServiceandItsSubservicesAll);
router.get("/:id", getServiceById);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);
router.patch("/:id/toggle-status", protect, toggleServiceStatus);

module.exports = router;
