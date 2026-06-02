import { create } from 'zustand';
import { User, AuthResponse } from '../types/index';
import api from '../services/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (data: any) => Promise<void>;
  signin: (data: any) => Promise<void>;
  logout: () => void;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  signup: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await api.signup(data);
      const { user, token } = response.data as AuthResponse;
      
      localStorage.setItem('auth_token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signin: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await api.signin(data);
      const { user, token } = response.data as AuthResponse;
      
      localStorage.setItem('auth_token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const response = await api.getProfile();
      set({
        user: response.data,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem('auth_token');
      set({ isAuthenticated: false, token: null });
    }
  },
}));

export default useAuthStore;
