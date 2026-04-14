import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== ISSUE API ====================

export const issueService = {
  // Lấy tất cả Issue (có thể truyền filter)
  getAll: (params = {}) => api.get("/issues", { params }),

  // Lấy chi tiết 1 Issue
  getById: (id) => api.get(`/issues/${id}`),

  // Tạo mới Issue
  create: (data) => api.post("/issues", data),

  // Cập nhật Issue
  update: (id, data) => api.put(`/issues/${id}`, data),

  // Xóa Issue
  delete: (id) => api.delete(`/issues/${id}`),
};

// ==================== USER API ====================

export const userService = {
  // Lấy tất cả User
  getAll: () => api.get("/users"),

  // Tạo mới User
  create: (data) => api.post("/users", data),

  // Cập nhật User
  update: (id, data) => api.put(`/users/${id}`, data),

  // Xóa User
  delete: (id) => api.delete(`/users/${id}`),
};

// ==================== SPRINT API ====================

export const sprintService = {
  // Lấy tất cả Sprints
  getAll: () => api.get("/sprints"),

  // Tạo mới Sprint
  create: (data) => api.post("/sprints", data),

  // Cập nhật Sprint
  update: (id, data) => api.put(`/sprints/${id}`, data),

  // Xóa Sprint
  delete: (id) => api.delete(`/sprints/${id}`),
};

export default api;
