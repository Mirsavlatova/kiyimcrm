import { create } from "zustand";

const stored = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

export const useAuthStore = create((set) => ({
  user: stored ? JSON.parse(stored) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,

  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export const ROLE_LABELS = {
  direktor: "Direktor",
  sotuv_menejeri: "Sotuv Menejeri",
  ombor_mudiri: "Ombor Mudiri",
  buxgalter: "Buxgalter",
};

export const ROLE_COLORS = {
  direktor: "bg-purple-100 text-purple-700",
  sotuv_menejeri: "bg-blue-100 text-blue-700",
  ombor_mudiri: "bg-green-100 text-green-700",
  buxgalter: "bg-orange-100 text-orange-700",
};
