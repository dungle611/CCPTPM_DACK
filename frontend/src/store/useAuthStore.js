import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/api";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Đăng nhập
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login(credentials);
          set({
            user: {
              _id: res.data._id,
              name: res.data.name,
              email: res.data.email,
              avatar: res.data.avatar,
              role: res.data.role,
            },
            token: res.data.token,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Lỗi đăng nhập",
            isLoading: false,
          });
          throw error;
        }
      },

      // Đăng ký
      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.register(credentials);
          set({
            user: {
              _id: res.data._id,
              name: res.data.name,
              email: res.data.email,
              avatar: res.data.avatar,
              role: res.data.role,
            },
            token: res.data.token,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Lỗi đăng ký",
            isLoading: false,
          });
          throw error;
        }
      },

      // Đăng xuất
      logout: () => {
        set({ user: null, token: null });
      },

      // Kiểm tra token còn hợp lệ không (Khi F5 lại trang)
      checkAuth: async () => {
        try {
          const res = await authService.getMe();
          set({ user: res.data });
        } catch (error) {
          set({ user: null, token: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage", // Key trong localStorage
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;
