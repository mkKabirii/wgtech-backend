const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createTeamRole,
  getAllTeamRoles,
  getTeamRoleById,
  updateTeamRole,
  deleteTeamRole
} = require("../controllers/teamRoleController");

const router = express.Router();

// Routes
router.post("/", protect, createTeamRole);
router.get("/", getAllTeamRoles);
router.get("/:id", getTeamRoleById);
router.put("/:id", protect, updateTeamRole);
router.delete("/:id", protect, deleteTeamRole);

module.exports = router;
