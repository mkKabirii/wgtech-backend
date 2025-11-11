const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Phase = mongoose.models.Phase || mongoose.model("Phase", phaseSchema);

module.exports = Phase;

