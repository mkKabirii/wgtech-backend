const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    collection: "advertisements",
  }
);

// Ensure collection is created
mongoose.model("Advertisement", advertisementSchema).createCollection();

// Ensure collection is created
module.exports = mongoose.model("Advertisement", advertisementSchema);
