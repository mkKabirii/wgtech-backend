const express = require("express");
const {
  uploadImage,
  uploadImageToCloudinary,
  uploadVideo,
  uploadVideoToCloudinary,
} = require("../controllers/uploadController");

const router = express.Router();

router.post("/image", uploadImage, uploadImageToCloudinary);
router.post("/video", uploadVideo, uploadVideoToCloudinary);

module.exports = router;

