import { api } from './api';
import type { LoginCredentials } from '../types';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    userType: 'admin' | 'student';
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },
};