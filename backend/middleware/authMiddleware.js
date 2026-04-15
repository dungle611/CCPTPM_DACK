const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực JWT Token
const protect = async (req, res, next) => {
  let token;

  // Kiểm tra header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm user từ id trong token (loại bỏ password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Token không hợp lệ - User không tồn tại" });
      }

      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có quyền truy cập - Thiếu Token" });
  }
};

// Middleware kiểm tra quyền trong Project
const checkProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const Project = require("../models/Project");
    const projectId = req.params.projectId || req.body.project;

    if (!projectId) {
      return res.status(400).json({ message: "Thiếu Project ID" });
    }

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Không tìm thấy dự án" });
      }

      // Owner luôn có quyền
      if (project.owner.toString() === req.user._id.toString()) {
        req.project = project;
        req.projectRole = "Owner";
        return next();
      }

      // Kiểm tra member
      const member = project.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res
          .status(403)
          .json({ message: "Bạn không phải thành viên của dự án này" });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          message: `Bạn không có quyền thực hiện hành động này. Yêu cầu: ${allowedRoles.join(", ")}`,
        });
      }

      req.project = project;
      req.projectRole = member.role;
      next();
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
};

module.exports = { protect, checkProjectRole };
