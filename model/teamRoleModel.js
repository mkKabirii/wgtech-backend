const mongoose = require("mongoose");

const teamRoleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "teamroles",
  }
);

// Ensure collection is created
mongoose.model("TeamRole", teamRoleSchema).createCollection();

module.exports = mongoose.model("TeamRole", teamRoleSchema);
