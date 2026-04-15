const Issue = require("../models/Issue");

// Lấy tất cả Issue (có thể lọc theo query)
const getIssues = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignee) filter.assignee = req.query.assignee;
    if (req.query.parentId) filter.parentId = req.query.parentId;
    if (req.query.sprint) filter.sprint = req.query.sprint; // Cho phép lọc theo Sprint
    if (req.query.sprint === "null") filter.sprint = null; // Lọc các thẻ Backlog (không có Sprint)

    const issues = await Issue.find(filter)
      .populate("assignee", "name email avatar")
      .populate("parentId", "title type")
      .populate("sprint", "name status startDate endDate")
      .sort({ order: 1, createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy chi tiết 1 Issue
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("assignee", "name email avatar")
      .populate("parentId", "title type")
      .populate("sprint", "name status startDate endDate");

    if (!issue) {
      return res.status(404).json({ message: "Không tìm thấy Issue" });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo Issue mới
const createIssue = async (req, res) => {
  try {
    const issue = new Issue(req.body);
    const savedIssue = await issue.save();

    // Populate để trả về đầy đủ thông tin
    const populatedIssue = await Issue.findById(savedIssue._id)
      .populate("assignee", "name email avatar")
      .populate("parentId", "title type")
      .populate("sprint", "name status startDate endDate");

    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ", error: error.message });
  }
};

// Cập nhật Issue
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignee", "name email avatar")
      .populate("parentId", "title type")
      .populate("sprint", "name status startDate endDate");

    if (!issue) {
      return res.status(404).json({ message: "Không tìm thấy Issue" });
    }
    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ", error: error.message });
  }
};

// Xóa Issue
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Không tìm thấy Issue" });
    }
    res.json({ message: "Đã xóa Issue thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
};
