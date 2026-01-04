import { create } from "zustand";
import { api } from "../api/axios";

type Role = "user" | "admin" | "supervisor";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  // ✅ نضيف phone كبراميتر
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: Role
  ) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ token: data.token, user: data.user, isAuthenticated: true });
  },

  register: async (name, email, password, phone, role) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
      role,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ token: data.token, user: data.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
