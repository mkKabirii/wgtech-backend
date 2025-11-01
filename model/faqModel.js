const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "faqs",
  }
);

// Ensure collection is created
mongoose.model("FAQ", faqSchema).createCollection();

// Ensure collection is created
module.exports = mongoose.model("FAQ", faqSchema);
