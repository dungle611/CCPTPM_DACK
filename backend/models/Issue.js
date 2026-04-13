const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề Issue là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Epic", "Story", "Task"],
      required: [true, "Loại Issue là bắt buộc"],
      default: "Task",
    },
    status: {
      type: String,
      enum: ["Todo", "InProgress", "Test", "Done"],
      default: "Todo",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Có thể chưa giao cho ai
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null, // Story thuộc Epic nào, Task thuộc Story nào
    },
    order: {
      type: Number,
      default: 0, // Thứ tự hiển thị trên cột Board (phục vụ kéo thả)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Issue", issueSchema);
