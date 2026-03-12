const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
createUser,
loginUser,
getAllUsers,
getUserById,
updateUser,
deleteUser,
getProfile,
updateProfile,
updateProfilePicture,
forgotPassword,
resetPassword,
toggleUserStatus,
} = require("../controllers/userController");

const router = express.Router();

// Auth routes
router.post("/", createUser);
router.post("/login", loginUser);

// OTP routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Profile routes (IMPORTANT: before :id routes)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/picture", protect, updateProfilePicture);

// User management routes
router.get("/", getAllUsers);
router.patch("/:id/toggle-status", protect, toggleUserStatus);
router.get("/:id", getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
