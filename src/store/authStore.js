import { create } from 'zustand';
import apiClient from '../api/client';

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('auth_token'),
  user: null,
  error: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('auth_token', data.token);
      set({ isAuthenticated: true, user: data.user, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Login fehlgeschlagen',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ isAuthenticated: false, user: null });
  },
}));
