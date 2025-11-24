const express = require("express");
const { getHomeData } = require("../controllers/homeController");

const router = express.Router();

// Route
router.get("/", getHomeData);

module.exports = router;

