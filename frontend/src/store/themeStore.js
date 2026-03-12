import { create } from "zustand";
import { persist } from "zustand/middleware";

const THEMES = ["light", "dark", "evening"];

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      dark: false,
      setTheme: (t) => set({ theme: t, dark: t !== "light" }),
      cycle: () => {
        const idx = THEMES.indexOf(get().theme);
        const next = THEMES[(idx + 1) % THEMES.length];
        set({ theme: next, dark: next !== "light" });
      },
      toggle: () => {
        const cur = get().theme;
        const next = cur === "light" ? "dark" : "light";
        set({ theme: next, dark: next !== "light" });
      },
    }),
    { name: "theme-storage" }
  )
);

export const THEME_LIST = THEMES;
