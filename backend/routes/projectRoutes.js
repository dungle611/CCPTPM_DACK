const express = require("express");
const router = express.Router();
const {
  getMyProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember,
} = require("../controllers/projectController");
const { protect, checkProjectRole } = require("../middleware/authMiddleware");

// Yêu cầu user phải đăng nhập
router.use(protect);

router.route("/")
  .get(getMyProjects)
  // Tạo project: Mọi user đã login đều có thể tạo
  .post(createProject);

router.route("/:projectId")
  // Xem project: cần quyền Owner, Admin, Member
  .get(checkProjectRole("Owner", "Admin", "Member"), getProjectById)
  // Sửa project: cần quyền Owner, Admin
  .put(checkProjectRole("Owner", "Admin"), updateProject)
  // Xóa project: Chỉ Owner mới được xóa
  .delete(checkProjectRole("Owner"), deleteProject);

// ========== QUẢN LÝ THÀNH VIÊN ==========
// Thêm thành viên: Owner, Admin
router.post("/:projectId/members", checkProjectRole("Owner", "Admin"), addMember);
// Cập nhật vai trò: Owner, Admin
router.put("/:projectId/members/:memberId", checkProjectRole("Owner", "Admin"), updateMemberRole);
// Xóa thành viên: Owner, Admin
router.delete("/:projectId/members/:memberId", checkProjectRole("Owner", "Admin"), removeMember);

module.exports = router;

