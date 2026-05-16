import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:          null,
      token:         null,
      isAuthenticated: false,
      initialized:   false,

      init: async () => {
        const { token, initialized } = get();
        if (initialized) return;
        if (!token) { set({ initialized: true }); return; }
        try {
          const res = await authApi.me();
          set({ user: res.data.data, isAuthenticated: true, initialized: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false, initialized: true });
        }
      },

      login: async (credentials) => {
        const res = await authApi.login(credentials);
        const { user, token } = res.data.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, initialized: true });
        return user;
      },

      register: async (data) => {
        const res = await authApi.register(data);
        const { user, token } = res.data.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, initialized: true });
        return user;
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, initialized: true });
      },

      setUser: (user) => set({ user }),

      fetchUser: async () => {
        try {
          const res = await authApi.me();
          set({ user: res.data.data, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'auth', partialize: (s) => ({ token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);
