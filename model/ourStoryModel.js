const mongoose = require("mongoose");

const ourStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  collection: "ourstory",
}
);

// Ensure collection is created
mongoose.model("OurStory", ourStorySchema).createCollection();

// Ensure collection is created
module.exports = mongoose.model("OurStory", ourStorySchema);

