// Utilities
import { LocationData } from "@/components/types";
import { defineStore } from "pinia";

export const useSearchStore = defineStore({
  id: "search",
  state: () => ({
    search: [] as LocationData[],
    index: 1,
  }),
  getters: {
    all: (state) => state.search,
    latest: (state) => state.search.slice(-1)[0],
  },
  actions: {
    addSearch(search: LocationData) {
      this.search.push(search);
      this.index++;
    },
  },
});
