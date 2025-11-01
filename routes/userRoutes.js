const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require("../controllers/userController");

const router = express.Router();

// Routes
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
router.patch("/:id/toggle-status", protect, toggleUserStatus);

module.exports = router;
