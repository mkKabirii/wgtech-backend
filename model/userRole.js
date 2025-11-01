const mongoose = require("mongoose");

const userRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      trim: true,
    },
    assignedPages: [
      {
        title: {
          type: String,
          required: true,
        },
        route: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "userroles",
  }
);

// Ensure collection is created
mongoose.model("UserRole", userRoleSchema).createCollection();

module.exports = mongoose.model("UserRole", userRoleSchema);
