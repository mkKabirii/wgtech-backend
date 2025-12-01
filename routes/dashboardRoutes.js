const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDashboardAnalytics } = require("../controllers/dashboardController");

const router = express.Router();

// Dashboard analytics route
router.get("/analytics", getDashboardAnalytics);

module.exports = router;

