const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err.message));

// Import Routes
const issueRoutes = require("./routes/issueRoutes");
const userRoutes = require("./routes/userRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

// Sử dụng Routes
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Route kiểm tra server
app.get("/", (req, res) => {
  res.json({ message: "🚀 Task Management API đang chạy!" });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
