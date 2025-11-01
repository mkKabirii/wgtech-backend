const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createOurStory,
  getAllOurStories,
  getOurStoryById,
  updateOurStory,
  deleteOurStory
} = require("../controllers/ourStoryController");

const router = express.Router();

// Routes
router.post("/", protect, createOurStory);
router.get("/", getAllOurStories);
router.get("/:id", getOurStoryById);
router.put("/:id", protect, updateOurStory);
router.delete("/:id", protect, deleteOurStory);

module.exports = router;
