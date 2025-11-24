const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String }, // HTML content allowed
    image: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    video: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    eventDate: { type: Date },
    location: { type: String },
    type: {
      type: String,
      enum: ["upcoming_event", "archive_event"],
      required: true,
    },
  },
  { timestamps: true }
);

mongoose.model("Events", eventSchema).createCollection();
module.exports = mongoose.model("Events", eventSchema);
