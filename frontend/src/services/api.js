import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Tự động gắn Bearer Token vào mọi request
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const stored = JSON.parse(authStorage);
        const token = stored.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Lỗi parse auth-storage:", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== ISSUE API ====================

export const issueService = {
  // Lấy tất cả Issue (có thể truyền filter, bao gồm project)
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
  // Lấy tất cả Sprints (có thể truyền filter project)
  getAll: (params = {}) => api.get("/sprints", { params }),

  // Tạo mới Sprint
  create: (data) => api.post("/sprints", data),

  // Cập nhật Sprint
  update: (id, data) => api.put(`/sprints/${id}`, data),

  // Xóa Sprint
  delete: (id) => api.delete(`/sprints/${id}`),
};

// ==================== AUTH API ====================

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ==================== PROJECT API ====================

export const projectService = {
  getMyProjects: () => api.get("/projects"),
  create: (data) => api.post("/projects", data),
  getById: (projectId) => api.get(`/projects/${projectId}`),
  update: (projectId, data) => api.put(`/projects/${projectId}`, data),
  delete: (projectId) => api.delete(`/projects/${projectId}`),
};

export default api;
