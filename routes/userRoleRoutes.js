const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createUserRole,
  getAllUserRoles,
  getUserRoleById,
  updateUserRole,
  deleteUserRole,
  addPageToUserRole,
  removePageFromUserRole
} = require("../controllers/userRoleController");

const router = express.Router();

// Routes
router.post("/", createUserRole);
router.get("/", getAllUserRoles);
router.get("/:id", getUserRoleById);
router.put("/:id", protect, updateUserRole);
router.delete("/:id", protect, deleteUserRole);
router.post("/:id/add-page", protect, addPageToUserRole);
router.delete("/:id/remove-page", protect, removePageFromUserRole);

module.exports = router;
