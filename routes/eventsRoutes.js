const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createEvent,
  getAllEvents,
  getAllEventsSorted,
  getEventById,
  getUpcomingEvents,
  getArchiveEvents,
  updateEvent,
  deleteEvent
} = require("../controllers/eventsController");

const router = express.Router();

// Routes
router.post("/", protect, createEvent);
router.get("/sorted", getAllEventsSorted);
router.get("/", getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/archive", getArchiveEvents);
router.get("/:id", getEventById);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;

