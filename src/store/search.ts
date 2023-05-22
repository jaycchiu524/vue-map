// Utilities
import { LocationData } from "@/components/types";
import { defineStore } from "pinia";

export const useSearchStore = defineStore({
  id: "search",
  state: () => ({
    search: [] as LocationData[],
    current: null as LocationData | null,
    index: 1,
  }),
  getters: {
    all: (state) => state.search,
  },
  actions: {
    add(search: LocationData) {
      this.search.push(search);
      this.current = search;
      this.index++;
    },
    setCurrent(search: LocationData) {
      this.current = search;
    },
    remove(id: LocationData["id"]) {
      this.search = this.search.filter((search) => search.id !== id);
    },
    bulkRemove(ids: LocationData["id"][]) {
      this.search = this.search.filter(
        (search) => ids.includes(search.id) === false
      );
    },
  },
});
