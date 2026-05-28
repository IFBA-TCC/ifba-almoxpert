import { create } from 'zustand';
import { tokenManager } from '../services/tokenManager';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  mustAcceptTerms: boolean;
  setAuth: (token: string, user: User, mustChangePassword?: boolean, mustAcceptTerms?: boolean) => void;
  setUser: (user: User) => void;
  setMustChangePassword: (value: boolean) => void;
  setMustAcceptTerms: (value: boolean) => void;
  logout: () => void;
}

const loadInitialState = () => {
  try {
    const token = tokenManager.restore();
    const userRaw = localStorage.getItem('almoxpert_user');
    if (token && userRaw) {
      const user = JSON.parse(userRaw) as User;
      const mustChangePassword = localStorage.getItem('almoxpert_mcp') === 'true';
      const mustAcceptTerms    = localStorage.getItem('almoxpert_mat') === 'true';
      return { user, isAuthenticated: true, mustChangePassword, mustAcceptTerms };
    }
  } catch {
    // ignora
  }
  return { user: null, isAuthenticated: false, mustChangePassword: false, mustAcceptTerms: false };
};

export const useAuthStore = create<AuthState>()((set) => ({
  ...loadInitialState(),

  setAuth: (token, user, mustChangePassword = false, mustAcceptTerms = false) => {
    tokenManager.set(token);
    localStorage.setItem('almoxpert_user', JSON.stringify(user));
    localStorage.setItem('almoxpert_mcp', String(mustChangePassword));
    localStorage.setItem('almoxpert_mat', String(mustAcceptTerms));
    set({ user, isAuthenticated: true, mustChangePassword, mustAcceptTerms });
  },

  setUser: (user) => {
    localStorage.setItem('almoxpert_user', JSON.stringify(user));
    set({ user });
  },

  setMustChangePassword: (value) => {
    localStorage.setItem('almoxpert_mcp', String(value));
    set({ mustChangePassword: value });
  },

  setMustAcceptTerms: (value) => {
    localStorage.setItem('almoxpert_mat', String(value));
    set({ mustAcceptTerms: value });
  },

  logout: () => {
    tokenManager.clear();
    localStorage.removeItem('almoxpert_mcp');
    localStorage.removeItem('almoxpert_mat');
    set({ user: null, isAuthenticated: false, mustChangePassword: false, mustAcceptTerms: false });
  },
}));
