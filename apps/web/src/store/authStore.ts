import { create } from 'zustand';
import { tokenManager } from '../services/tokenManager';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const loadInitialState = () => {
  try {
    const token = tokenManager.restore();
    const userRaw = localStorage.getItem('almoxpert_user');
    if (token && userRaw) {
      const user = JSON.parse(userRaw) as User;
      return { user, isAuthenticated: true };
    }
  } catch {
    // ignora
  }
  return { user: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>()((set) => ({
  ...loadInitialState(),

  setAuth: (token, user) => {
    tokenManager.set(token);
    localStorage.setItem('almoxpert_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('almoxpert_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    tokenManager.clear();
    set({ user: null, isAuthenticated: false });
  },
}));