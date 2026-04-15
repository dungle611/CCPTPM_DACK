const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên Sprint là bắt buộc (VD: Sprint 1)"],
      trim: true,
    },
    goal: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Future", "Active", "Closed"],
      default: "Future",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Sprint phải thuộc về một Project cụ thể"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sprint", sprintSchema);
