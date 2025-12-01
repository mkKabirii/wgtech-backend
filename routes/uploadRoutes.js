const express = require("express");
const {
  uploadImage,
  uploadImageToCloudinary,
  uploadVideo,
  uploadVideoToCloudinary,
  uploadFile,
  uploadFileToCloudinary,
} = require("../controllers/uploadController");

const router = express.Router();

router.post("/image", uploadImage, uploadImageToCloudinary);
router.post("/video", uploadVideo, uploadVideoToCloudinary);
router.post("/file", uploadFile, uploadFileToCloudinary);

module.exports = router;

