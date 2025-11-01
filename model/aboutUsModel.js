const mongoose = require("mongoose");

const aboutUsSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "aboutus",
  }
);

// Ensure collection is created
mongoose.model("AboutUs", aboutUsSchema).createCollection();

module.exports = mongoose.model("AboutUs", aboutUsSchema);