import { api } from './api';
import type { LoginCredentials } from '../types';

export interface LoginResponse {
  accessToken: string;
  mustChangePassword: boolean;
  mustAcceptTerms: boolean;
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async validateResetCode(email: string, code: string): Promise<{ valid: boolean }> {
    const { data } = await api.post('/auth/validate-reset-code', { email, code });
    return data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { email, code, newPassword });
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.patch('/auth/change-password', { currentPassword, newPassword });
    return data;
  },

  async me(): Promise<import('../types').User> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async updatePreferences(receiveEmails: boolean): Promise<{ message: string }> {
    const { data } = await api.patch('/auth/preferences', { receiveEmails });
    return data;
  },

  async acceptTerms(): Promise<{ message: string }> {
    const { data } = await api.patch('/auth/accept-terms');
    return data;
  },

  async exportMyData(): Promise<void> {
    const res      = await api.get('/auth/me/export', { responseType: 'blob' });
    const today    = new Date().toISOString().slice(0, 10);
    const filename = `meus-dados-almoxpert-${today}.json`;
    const url      = URL.createObjectURL(res.data as Blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
