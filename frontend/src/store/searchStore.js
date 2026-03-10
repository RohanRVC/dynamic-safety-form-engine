import { create } from "zustand";

export const useSearchStore = create((set) => ({
  query: "",
  setQuery: (query) => set({ query: typeof query === "string" ? query : "" }),
  clearQuery: () => set({ query: "" }),
}));
