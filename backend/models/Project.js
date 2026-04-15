const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên dự án là bắt buộc"],
      trim: true,
    },
    key: {
      type: String,
      required: [true, "Mã dự án (Key) là bắt buộc"],
      uppercase: true,
      trim: true,
      maxlength: [10, "Mã dự án tối đa 10 ký tự"],
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Chủ sở hữu dự án là bắt buộc"],
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["Owner", "Admin", "Member"],
          default: "Member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    avatar: {
      type: String,
      default: "", // URL avatar của project
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
