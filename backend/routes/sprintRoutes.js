const express = require("express");
const router = express.Router();
const sprintController = require("../controllers/sprintController");

// Lấy danh sách Sprints
router.get("/", sprintController.getSprints);

// Tạo Sprint mới
router.post("/", sprintController.createSprint);

// Cập nhật Sprint
router.put("/:id", sprintController.updateSprint);

// Xóa Sprint
router.delete("/:id", sprintController.deleteSprint);

module.exports = router;
