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

module.exports = {
  getMyProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
};
