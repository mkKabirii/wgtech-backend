const cloudinary = require("cloudinary").v2;
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed", 400), false);
  }
};

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only video files are allowed", 400), false);
  }
};

const imageUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const videoUpload = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

exports.uploadImage = imageUpload.single("image");
exports.uploadVideo = videoUpload.single("video");

exports.uploadImageToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please provide an image file", 400));
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "wgtech",
      resource_type: "auto",
    });

    successHandler(
      res,
      {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
      "Image uploaded successfully",
      200
    );
  } catch (error) {
    return next(new AppError(`Failed to upload image: ${error.message}`, 500));
  }
});

exports.uploadVideoToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please provide a video file", 400));
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "wgtech/videos",
      resource_type: "video",
    });

    successHandler(
      res,
      {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        duration: result.duration,
      },
      "Video uploaded successfully",
      200
    );
  } catch (error) {
    return next(new AppError(`Failed to upload video: ${error.message}`, 500));
  }
});

