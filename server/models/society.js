const mongoose = require("mongoose");
const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    totalMembers: {
      type: Number,
      default: 0,
    },

    financialYear: {
      type: String,
      default: "2026-27",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Society ||
  mongoose.model("Society", societySchema);