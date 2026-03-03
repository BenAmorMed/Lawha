'use client';

import { create } from 'zustand';
import { authApi, User, LoginResponse } from '@/lib/auth-api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  register: (email: string, password: string, full_name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  register: async (email: string, password: string, full_name?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.register(email, password, full_name);
      set({ user: response.data, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      const { user, access_token } = response.data;

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      set({ user, token: access_token, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: () => {
    authApi.logout();
    set({ user: null, token: null, error: null });
  },

  getCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await authApi.getCurrentUser();
      set({ user: response.data, loading: false });
    } catch (error: any) {
      set({ user: null, token: null, error: 'Failed to fetch user', loading: false });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User | null) => set({ user }),

  setToken: (token: string | null) => set({ token }),
}));

// Initialize auth state from localStorage on client side
if (typeof window !== 'undefined') {
  const savedToken = localStorage.getItem('access_token');
  const savedUser = localStorage.getItem('user');

  if (savedToken) {
    useAuthStore.setState({ token: savedToken });
  }

  if (savedUser) {
    try {
      useAuthStore.setState({ user: JSON.parse(savedUser) });
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
  }
}
