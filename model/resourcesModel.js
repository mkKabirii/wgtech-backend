const mongoose = require("mongoose");

const resourcesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String },
    image: { type: String },
    productImages: { type: [String] },
    productLink: { type: String },
    postedOn: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["blog", "article", "product"],
    },
  },
  { timestamps: true }
);
mongoose.model("Resources", resourcesSchema).createCollection();
module.exports = mongoose.model("Resources", resourcesSchema);
