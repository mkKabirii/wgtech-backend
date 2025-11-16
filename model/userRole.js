const mongoose = require("mongoose");
const { Schema } = mongoose;

const routeSchema = new Schema(
  {
    order: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: [
      {
        type: Schema.Types.Mixed,
        default: {},
      },
    ],
  },
  { _id: false }
);

const userRoleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    totalRoutes: {
      type: Number,
      default: 0,
    },
    routes: {
      type: [routeSchema],
      default: [],
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "userroles",
    timestamps: true,
  }
);

// Ensure collection is created
mongoose.model("UserRole", userRoleSchema).createCollection();

module.exports = mongoose.model("UserRole", userRoleSchema);
