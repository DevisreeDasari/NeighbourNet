import { create } from "zustand";
import { apiFetch } from "../lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  coinBalance?: number;
  avatar?: string | null;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  setSession: (params: { user: User; accessToken: string }) => void;
  fetchMe: () => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  sendOtp: (params: { email: string }) => Promise<{ devOtp?: string }>;
  verifyOtp: (params: { email: string; code: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  loading: false,
  error: null,

  setSession: ({ user, accessToken }) => {
    set({ user, accessToken });
  },

  fetchMe: async () => {
    const token = get().accessToken;
    if (!token) return;
    const res = await apiFetch<{ user: User }>("/api/users/me", { accessToken: token });
    set({ user: res.user });
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch<{ user: User; accessToken: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      set({ user: res.user, accessToken: res.accessToken, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  sendOtp: async ({ email }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch<{ ok: true; devOtp?: string }>("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      set({ loading: false });
      return { devOtp: res.devOtp };
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  verifyOtp: async ({ email, code }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch<{ user: User; accessToken: string }>("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code })
      });
      set({ user: res.user, accessToken: res.accessToken, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  logout: async () => {
    const token = get().accessToken;
    set({ loading: true, error: null });
    try {
      await apiFetch<{ ok: true }>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
        accessToken: token ?? undefined
      });
    } finally {
      set({ user: null, accessToken: null, loading: false });
    }
  }
}));
