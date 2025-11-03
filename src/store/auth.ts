import { create } from "zustand";

type Role = "admin" | "user" | "supervisor";
type User = { id: string; name: string; email: string; role: Role };

function lsGet<T>(k: string): T | null {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet(k: string, v: any) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function lsDel(k: string) { try { localStorage.removeItem(k); } catch {} }

export const useAuthStore = create<{
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}>((set) => ({
  user: lsGet<User>("user"),
  token: lsGet<string>("token"),
  isAuthenticated: !!lsGet<string>("token"),

  async login(email) {
    const role: Role = email.toLowerCase().includes("admin") ? "admin" : "user";
    const user: User = {
      id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      name: email.split("@")[0],
      email,
      role,
    };
    const token = "mock-" + (crypto?.randomUUID ? crypto.randomUUID() : Date.now());
    lsSet("user", user);
    lsSet("token", token);
    set({ user, token, isAuthenticated: true });
  },

  async register(name, email) {
    const role: Role = email.toLowerCase().includes("admin") ? "admin" : "user";
    const user: User = {
      id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      name: name || email.split("@")[0],
      email,
      role,
    };
    const token = "mock-" + (crypto?.randomUUID ? crypto.randomUUID() : Date.now());
    lsSet("user", user);
    lsSet("token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout() {
    lsDel("user");
    lsDel("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
