const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createSubService,
  getAllSubServices,
  getSubServiceById,
  updateSubService,
  deleteSubService,
  getSubServicesByServiceId
} = require("../controllers/subServiceController");

const router = express.Router();

// Routes
router.post("/", protect, createSubService);
router.get("/", getAllSubServices);
router.get("/service/:serviceId", getSubServicesByServiceId);
router.get("/:id", getSubServiceById);
router.put("/:id", protect, updateSubService);
router.delete("/:id", protect, deleteSubService);

module.exports = router;
