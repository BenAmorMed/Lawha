import apiClient from './api-client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export const authApi = {
  register: (email: string, password: string, full_name?: string) =>
    apiClient.post<User>('/auth/register', {
      email,
      password,
      full_name,
    }),

  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    }),

  getCurrentUser: () =>
    apiClient.get<User>('/auth/me'),

  logout: () => {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },
};
