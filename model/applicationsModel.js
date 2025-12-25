const mongoose = require("mongoose");

const applicationsSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    idType: {
      type: String,
      enum: ["govt_id", "passport"],
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
      default: null,
    },
    address: {
      streetName: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
    },
    phone: {
      phoneNumber: {
        type: String,
        trim: true,
      },
      landlineNumber: {
        type: String,
        trim: true,
      },
    },
    // Education
    education: {
      highSchool: {
        name: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
      },
      university: {
        name: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
      },
    },
    // Skills
    skills: [
      {
        skill: {
          type: String,
          trim: true,
        },
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          trim: true,
        },
      },
    ],
    // File Uploads
    cvResume: {
      type: String, // File URL/path
    },
    picture: {
      type: String, // File URL/path
    },
    // Certification
    certification: {
      type: Boolean,
      default: false,
    },
    // Status for admin
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

mongoose.model("Applications", applicationsSchema).createCollection();
module.exports = mongoose.model("Applications", applicationsSchema);
