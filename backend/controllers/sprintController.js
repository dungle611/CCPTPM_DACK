const Sprint = require("../models/Sprint");
const Issue = require("../models/Issue");

// Lấy danh sách toàn bộ Sprint theo Project
exports.getSprints = async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) {
        filter.project = req.query.project;
    }
    const sprints = await Sprint.find(filter).sort({ createdAt: 1 });
    res.status(200).json(sprints);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách Sprint", error: error.message });
  }
};

// Tạo Sprint mới
exports.createSprint = async (req, res) => {
  try {
    // Tự động sinh tên "Sprint X" nếu không truyền vào
    let name = req.body.name;
    if (!name) {
      const count = await Sprint.countDocuments();
      name = `Sprint ${count + 1}`;
    }

    const newSprint = new Sprint({ ...req.body, name });
    const savedSprint = await newSprint.save();
    res.status(201).json(savedSprint);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo Sprint", error: error.message });
  }
};

// Cập nhật thông tin Sprint (Bao gồm Start/Complete Sprint)
exports.updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Nếu chuyển status thành Active, phải đảm bảo không có Sprint nào khác đang Active
    if (req.body.status === "Active") {
      const activeSprint = await Sprint.findOne({ status: "Active", _id: { $ne: id } });
      if (activeSprint) {
        return res.status(400).json({ 
          message: "Chỉ được phép chạy 1 Sprint cùng lúc. Vui lòng kết thúc Sprint hiện tại." 
        });
      }
      
      // Tự động set startDate nếu trống
      if (!req.body.startDate) {
        req.body.startDate = new Date();
      }
    }

    // Nếu chuyển status thành Closed
    if (req.body.status === "Closed") {
      if (!req.body.endDate) {
        req.body.endDate = new Date();
      }
    }

    const updatedSprint = await Sprint.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSprint) {
      return res.status(404).json({ message: "Không tìm thấy Sprint" });
    }

    res.status(200).json(updatedSprint);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật Sprint", error: error.message });
  }
};

// Xóa Sprint
exports.deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSprint = await Sprint.findByIdAndDelete(id);

    if (!deletedSprint) {
      return res.status(404).json({ message: "Không tìm thấy Sprint" });
    }

    // Sau khi xóa Sprint, trả lại toàn bộ Issue trong Sprint đó về Backlog
    await Issue.updateMany({ sprint: id }, { sprint: null });

    res.status(200).json({ message: "Đã xóa Sprint và trả các Issue về Backlog" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa Sprint", error: error.message });
  }
};
