const Project = require("../models/Project");

// Lấy tất cả project mà User hiện tại có tham gia (Owner, Admin, hoặc Member)
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách Project", error: error.message });
  }
};

// Tạo Project mới
const createProject = async (req, res) => {
  try {
    const { name, key, description } = req.body;

    // Lúc tạo, User hiện tại tự động là Owner và tự động thêm vào danh sách members luôn
    const project = new Project({
      name,
      key,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "Owner",
        },
      ],
      // Icon mặc định cho Project
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        key || "P"
      )}&background=random&length=2`,
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ", error: error.message });
  }
};

// Xem chi tiết 1 Project
const getProjectById = async (req, res) => {
  try {
    // req.project được gán từ middleware 'checkProjectRole'
    const project = await Project.findById(req.project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// Cập nhật thông tin Project
const updateProject = async (req, res) => {
    try {
        const { name, key, description } = req.body;
        // Chỉ update những field được phép
        req.project.name = name || req.project.name;
        req.project.key = key || req.project.key;
        req.project.description = description !== undefined ? description : req.project.description;
        
        await req.project.save();
        res.json(req.project);
    } catch(error) {
        res.status(400).json({ message: "Lỗi cập nhật Project", error: error.message });
    }
}

// Xóa Project
const deleteProject = async (req, res) => {
    try {
        // Bạn có thể cân nhắc viết thêm logic xóa tất cả bộ Issue/Sprint của Project này
        // Const Issue = require("../models/Issue")...
        
        await Project.findByIdAndDelete(req.project._id);
        res.json({ message: "Đã xóa Project thành công" });
    } catch(error) {
        res.status(500).json({ message: "Lỗi khi xóa Project", error: error.message});
    }
}

// ========== QUẢN LÝ THÀNH VIÊN ==========

// Thêm thành viên vào Project bằng email
const addMember = async (req, res) => {
  const User = require("../models/User");
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    // Chỉ cho phép thêm với role Admin hoặc Member
    const validRole = role === "Admin" ? "Admin" : "Member";

    // Tìm user bằng email
    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      return res.status(404).json({ message: "Không tìm thấy người dùng với email này" });
    }

    // Kiểm tra user đã là thành viên chưa
    const isAlreadyMember = req.project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: "Người dùng này đã là thành viên của dự án" });
    }

    // Thêm vào mảng members
    req.project.members.push({
      user: userToAdd._id,
      role: validRole,
    });
    await req.project.save();

    // Populate lại để trả về dữ liệu đầy đủ
    const updatedProject = await Project.findById(req.project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.status(201).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm thành viên", error: error.message });
  }
};

// Cập nhật vai trò của một thành viên
const updateMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    if (!role || !["Admin", "Member"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ. Chỉ chấp nhận: Admin, Member" });
    }

    // Không cho phép thay đổi role của Owner
    const memberEntry = req.project.members.find(
      (m) => m.user.toString() === memberId
    );

    if (!memberEntry) {
      return res.status(404).json({ message: "Không tìm thấy thành viên này trong dự án" });
    }

    if (memberEntry.role === "Owner") {
      return res.status(403).json({ message: "Không thể thay đổi vai trò của chủ sở hữu dự án" });
    }

    // Cập nhật role
    memberEntry.role = role;
    await req.project.save();

    const updatedProject = await Project.findById(req.project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật vai trò", error: error.message });
  }
};

// Xóa thành viên khỏi Project
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Không cho phép xóa Owner
    if (req.project.owner.toString() === memberId) {
      return res.status(403).json({ message: "Không thể xóa chủ sở hữu dự án" });
    }

    const memberIndex = req.project.members.findIndex(
      (m) => m.user.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy thành viên này trong dự án" });
    }

    // Admin không được xóa Admin khác hoặc Owner - chỉ Owner mới được xóa Admin
    if (req.projectRole === "Admin" && req.project.members[memberIndex].role === "Admin") {
      return res.status(403).json({ message: "Admin không thể xóa Admin khác" });
    }

    req.project.members.splice(memberIndex, 1);
    await req.project.save();

    const updatedProject = await Project.findById(req.project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa thành viên", error: error.message });
  }
};

module.exports = {
  getMyProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember,
};
