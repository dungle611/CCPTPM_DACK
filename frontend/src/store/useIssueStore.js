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

  // Gán Issue vào một Sprint (Kéo thả trên màn hình Backlog)
  assignSprint: async (id, sprintId) => {
    const previousIssues = get().issues;

    // Bước 1: Cập nhật UI ngay (optimistic)
    set((state) => ({
      issues: state.issues.map((issue) => {
        if (issue._id === id) {
          // Nếu sprint rỗng (backlog) thì cần đảm bảo sprint được set thành Object rỗng hoặc String ID
          // Tốt nhất là fetch lại hoặc fake data. Ở đây ta fake sprint = { _id: sprintId } (nếu có id) hoặc null
          return { 
            ...issue, 
            sprint: sprintId === "null" || !sprintId ? null : { _id: sprintId } 
          };
        }
        return issue;
      }),
    }));

    // Bước 2: Gọi API cập nhật database (gửi string ID cho DB)
    try {
      const apiSprintId = sprintId === "null" ? null : sprintId;
      await issueService.update(id, { sprint: apiSprintId });
      // Fetch lại để load data chuẩn `populate` sprint
      get().fetchIssues();
    } catch (error) {
      // Rollback nếu API lỗi
      set({ issues: previousIssues, error: error.message });
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

  // Đổi thứ tự Issue trong cùng 1 Box (drag trong cùng cột hoặc cùng 1 sprint/backlog)
  reorderIssues: (boxId, sourceIndex, destIndex, isBoard = true) => {
    const allIssues = [...get().issues];
    
    // Lọc issue thuộc rổ đó
    let columnIssues = [];
    let otherIssues = [];
    
    if (isBoard) {
        // Drag trên Board (so theo status)
        columnIssues = allIssues.filter((i) => i.status === boxId);
        otherIssues = allIssues.filter((i) => i.status !== boxId);
    } else {
        // Drag trên Backlog (so theo sprint ID)
        if (boxId === "backlog") {
            columnIssues = allIssues.filter((i) => !i.sprint || i.sprint === "null");
            otherIssues = allIssues.filter((i) => i.sprint && i.sprint !== "null");
        } else {
            columnIssues = allIssues.filter((i) => i.sprint && (i.sprint._id === boxId || i.sprint === boxId));
            otherIssues = allIssues.filter((i) => !i.sprint || (i.sprint._id !== boxId && i.sprint !== boxId));
        }
    }

    // Đổi vị trí trong mảng columnIssues
    if (columnIssues.length === 0) return;
    const [movedItem] = columnIssues.splice(sourceIndex, 1);
    columnIssues.splice(destIndex, 0, movedItem);

    // Ghép lại mảng: other + column (đã sắp xếp lại)
    set({ issues: [...otherIssues, ...columnIssues] });
  },
}));

export default useIssueStore;
