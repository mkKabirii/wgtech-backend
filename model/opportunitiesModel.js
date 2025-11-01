const mongoose = require("mongoose");

const opportunitiesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  opportunity: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    }
  ],
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
}, {
  timestamps: true,
  collection: "opportunities",
}
);

// Ensure collection is created
mongoose.model("Opportunities", opportunitiesSchema).createCollection();

// Ensure collection is created
module.exports = mongoose.model("Opportunities", opportunitiesSchema);