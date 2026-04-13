import { create } from "zustand";
import { userService } from "../services/api";

const useUserStore = create((set) => ({
  // State
  users: [],
  loading: false,
  error: null,

  // Lấy tất cả Users
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await userService.getAll();
      set({ users: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Tạo User mới
  addUser: async (data) => {
    try {
      const response = await userService.create(data);
      set((state) => ({ users: [...state.users, response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

export default useUserStore;
