import { create } from "zustand";
import { projectService } from "../services/api";

const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Lấy danh sách dự án mà user tham gia
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await projectService.getMyProjects();
      set({ projects: res.data, isLoading: false });
    } catch (error) {
      set({ error: "Lỗi tải danh sách dự án", isLoading: false });
    }
  },

  // Set project đang chọn (khi click vào 1 project)
  setCurrentProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await projectService.getById(projectId);
      set({ currentProject: res.data, isLoading: false });
    } catch (error) {
      set({ error: "Lỗi tải thông tin dự án", isLoading: false });
    }
  },

  // Tạo project mới
  createNewProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await projectService.create(projectData);
      set((state) => ({
        projects: [res.data, ...state.projects],
        isLoading: false,
      }));
      return res.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Lỗi tạo dự án",
        isLoading: false,
      });
      throw error;
    }
  },

  clearCurrentProject: () => set({ currentProject: null }),
}));

export default useProjectStore;
