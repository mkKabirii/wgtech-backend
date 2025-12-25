const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    privacyPolicy: {
      type: String,
      default: "",
    },
    termsCondition: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "settings",
  }
);

// Ensure collection is created
mongoose.model("Settings", settingsSchema).createCollection();

module.exports = mongoose.model("Settings", settingsSchema);

