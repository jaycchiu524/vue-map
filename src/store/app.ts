// Utilities
import { defineStore } from "pinia";

export const useSearchStore = defineStore({
  id: "searches",
  state: () => ({
    searches: [] as string[],
  }),
  getters: {
    history: (state) => state.searches,
  },
  actions: {
    addSearch(search: string) {
      this.searches.push(search);
    },
  },
});
