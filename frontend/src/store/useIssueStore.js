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

  // Di chuyển Issue sang cột khác (Optimistic Update cho Drag & Drop)
  // Cập nhật UI ngay lập tức, gọi API ngầm, rollback nếu lỗi
  moveIssue: async (id, newStatus) => {
    const previousIssues = get().issues;

    // Bước 1: Cập nhật UI ngay (optimistic)
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue._id === id ? { ...issue, status: newStatus } : issue
      ),
    }));

    // Bước 2: Gọi API cập nhật database
    try {
      await issueService.update(id, { status: newStatus });
    } catch (error) {
      // Rollback nếu API lỗi
      set({ issues: previousIssues, error: error.message });
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

  // Đổi thứ tự Issue trong cùng 1 cột (drag trong cùng cột)
  reorderIssues: (status, sourceIndex, destIndex) => {
    const allIssues = [...get().issues];
    // Lọc ra các issue thuộc cột đang xử lý
    const columnIssues = allIssues.filter((i) => i.status === status);
    // Lọc ra các issue KHÔNG thuộc cột đang xử lý
    const otherIssues = allIssues.filter((i) => i.status !== status);

    // Đổi vị trí trong mảng columnIssues
    const [movedItem] = columnIssues.splice(sourceIndex, 1);
    columnIssues.splice(destIndex, 0, movedItem);

    // Ghép lại mảng: other + column (đã sắp xếp lại)
    set({ issues: [...otherIssues, ...columnIssues] });
  },
}));

export default useIssueStore;
