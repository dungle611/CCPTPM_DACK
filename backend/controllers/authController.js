const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Hàm tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Đăng ký User mới
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng" });
    }

    const user = await User.create({
      name,
      email,
      password,
      // Có thể sinh ngẫu nhiên avatar từ UI Faces API
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Không thể tạo tài khoản lúc này" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// Đăng nhập
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Kiểm tra user có tồn tại và password có khớp (bằng hàm comparePassword mình tự định nghĩa ở model)
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Sai Email hoặc Mật khẩu" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// Lấy thông tin user hiện tại qua Token (ví dụ lúc f5 lại trang web)
const getMe = async (req, res) => {
  try {
    // req.user được middleware 'protect' gán vào
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
