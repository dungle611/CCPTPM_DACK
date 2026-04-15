const express = require("express");
const router = express.Router();
const {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");

const { protect } = require("../middleware/authMiddleware");

// Bảo vệ tất cả API issue
router.use(protect);

router.get("/", getIssues);
router.get("/:id", getIssueById);
router.post("/", createIssue);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);

module.exports = router;
