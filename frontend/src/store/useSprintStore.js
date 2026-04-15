import { create } from "zustand";
import { sprintService } from "../services/api";
import useProjectStore from "./useProjectStore";

const useSprintStore = create((set, get) => ({
  // State
  sprints: [],
  loading: false,
  error: null,

  // Lấy danh sách Sprints (truyền project để lọc theo dự án)
  fetchSprints: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await sprintService.getAll(params);
      set({ sprints: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Tạo Sprint Mới
  addSprint: async (data = {}) => {
    try {
      // Tự động đính kèm project ID nếu chưa có
      if (!data.project) {
        const currentProject = useProjectStore.getState().currentProject;
        if (currentProject) {
          data.project = currentProject._id;
        } else {
          throw new Error("Không thể tạo dữ liệu: Chưa chọn dự án!");
        }
      }
      
      const response = await sprintService.create(data);
      set((state) => ({ sprints: [...state.sprints, response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Cập nhật Sprint (Start Sprint, Complete Sprint, đổi tên...)
  updateSprint: async (id, data) => {
    try {
      const response = await sprintService.update(id, data);
      
      set((state) => ({
        sprints: state.sprints.map((sprint) =>
          sprint._id === id ? response.data : sprint
        ),
      }));
      
      // Nếu là Active thì phải map lại để các Sprint khác đang Active bị mất Active (dù DB chặn rồi nhưng FE cần match state)
      if (data.status === "Active") {
          set((state) => ({
              sprints: state.sprints.map((sprint) => 
                  sprint._id === id ? response.data : { ...sprint, status: sprint.status === "Active" ? "Closed" : sprint.status } 
              )
          }));
      }

      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  // Xóa Sprint
  removeSprint: async (id) => {
    try {
      await sprintService.delete(id);
      set((state) => ({
        sprints: state.sprints.filter((sprint) => sprint._id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Helper selectors
  getActiveSprint: () => {
      return get().sprints.find((s) => s.status === "Active") || null;
  }
}));

export default useSprintStore;
