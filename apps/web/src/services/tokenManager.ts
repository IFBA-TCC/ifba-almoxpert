/**
 * Singleton que mantém o token JWT em memória.
 * É o único lugar do app que sabe o token atual.
 * Não depende do React, Zustand ou localStorage.
 */

let _token: string | null = null;

export const tokenManager = {
  get: (): string | null => _token,

  set: (token: string): void => {
    _token = token;
    localStorage.setItem('almoxpert_token', token);
  },

  clear: (): void => {
    _token = null;
    localStorage.removeItem('almoxpert_token');
    localStorage.removeItem('almoxpert_user');
  },

  /** Chamado na inicialização da app para restaurar sessão */
  restore: (): string | null => {
    const token = localStorage.getItem('almoxpert_token');
    if (token && token !== 'null' && token !== 'undefined') {
      _token = token;
      return token;
    }
    return null;
  },
};