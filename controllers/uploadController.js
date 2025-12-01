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

// Generic file filter for all file types
const genericFileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    // Text files
    "text/plain",
    "text/csv",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type not allowed. Allowed types: Images, PDF, Word, Excel, PowerPoint, Text, Archives, Videos`,
        400
      ),
      false
    );
  }
};

const genericUpload = multer({
  storage: storage,
  fileFilter: genericFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

exports.uploadImage = imageUpload.single("image");
exports.uploadVideo = videoUpload.single("video");
exports.uploadFile = genericUpload.single("file");

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

// Generic file upload handler - supports all file types
exports.uploadFileToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please provide a file", 400));
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  // Determine resource type based on file mime type
  let resourceType = "auto";
  let folder = "wgtech/files";

  if (req.file.mimetype.startsWith("image/")) {
    resourceType = "image";
    folder = "wgtech/images";
  } else if (req.file.mimetype.startsWith("video/")) {
    resourceType = "video";
    folder = "wgtech/videos";
  } else {
    // For documents (PDF, Word, Excel, etc.), use raw resource type
    resourceType = "raw";
    folder = "wgtech/documents";
  }

  try {
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
    };

    // For raw files, add use_filename and unique_filename options
    if (resourceType === "raw") {
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = true;
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    // Prepare response data
    const responseData = {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      original_filename: req.file.originalname,
      mimetype: req.file.mimetype,
    };

    // Add image/video specific fields if applicable
    if (result.width) responseData.width = result.width;
    if (result.height) responseData.height = result.height;
    if (result.duration) responseData.duration = result.duration;

    successHandler(
      res,
      responseData,
      "File uploaded successfully",
      200
    );
  } catch (error) {
    return next(new AppError(`Failed to upload file: ${error.message}`, 500));
  }
});



