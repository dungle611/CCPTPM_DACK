import { create } from "zustand";
import { issueService } from "../services/api";

const useIssueStore = create((set, get) => ({
  // State
  issues: [],
  loading: false,
  error: null,

  // Lấy tất cả Issues từ API
  fetchIssues: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await issueService.getAll(params);
      set({ issues: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Tạo Issue mới
  addIssue: async (data) => {
    try {
      const response = await issueService.create(data);
      set((state) => ({ issues: [...state.issues, response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Cập nhật Issue (dùng cho cả kéo thả đổi status)
  updateIssue: async (id, data) => {
    try {
      const response = await issueService.update(id, data);
      set((state) => ({
        issues: state.issues.map((issue) =>
          issue._id === id ? response.data : issue
        ),
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Xóa Issue
  removeIssue: async (id) => {
    try {
      await issueService.delete(id);
      set((state) => ({
        issues: state.issues.filter((issue) => issue._id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Lấy Issues theo status (phục vụ Board columns)
  getIssuesByStatus: (status) => {
    return get().issues.filter((issue) => issue.status === status);
  },
}));

export default useIssueStore;
