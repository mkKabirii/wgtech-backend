const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,      // ✅ ADD
  updateProfile,   // ✅ ADD
  forgotPassword,  // ✅
  resetPassword,   // ✅
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

// ✅ OTP Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

//profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
// router.put("/profile/picture", protect, updateProfilePicture); // multipart  

module.exports = router;
