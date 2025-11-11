const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createPhase,
  getAllPhases,
  getPhaseById,
  updatePhase,
  deletePhase,
  getPhaseByProposalId,
} = require("../controllers/phaseController");

const router = express.Router();

router.post("/", protect, createPhase);
router.get("/", protect, getAllPhases);
router.get("/:id", protect, getPhaseById);
router.put("/:id", protect, updatePhase);
router.delete("/:id", protect, deletePhase);
router.get("/proposal/:proposalId", protect, getPhaseByProposalId);

module.exports = router;

