const mongoose = require("mongoose");

// const settingsSchema = new mongoose.Schema(
//   {
//     privacyPolicy: {
//       type: String,
//       default: "",
//     },
//     termsCondition: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//     collection: "settings",
//   }
// );

// // Ensure collection is created
// mongoose.model("Settings", settingsSchema).createCollection();

// module.exports = mongoose.model("Settings", settingsSchema);

// const mongoose = require("mongoose");
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
    // ✅ NAYA ADD KARO
    proposalEmailTemplate: {
      type: String,
      default: "",
    },    // ✅ NAYA ADD KARO
    senderEmail: {
      type: String,
      default: "",
    },
    applicationEmailTemplate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "settings",
  },
);
mongoose.models.Settings ||
  mongoose.model("Settings", settingsSchema).createCollection();
module.exports =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
