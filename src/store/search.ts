// Utilities
import { LocationData } from '@/components/types'
import { defineStore } from 'pinia'

export const useSearchStore = defineStore({
  id: 'search',
  state: () => ({
    search: [] as LocationData[],
    markers: {} as Record<LocationData['id'], google.maps.Marker>,
    current: null as LocationData | null,
    index: 1,
  }),
  getters: {
    all: (state) => state.search,
  },
  actions: {
    add(search: LocationData) {
      this.search.push(search)
      this.current = search
      this.index++
    },
    setCurrent(search: LocationData) {
      this.current = search
    },
    remove(id: LocationData['id']) {
      this.search = this.search.filter((search) => search.id !== id)

      for (const [key, value] of Object.entries(this.markers)) {
        if (key === id) {
          value.setMap(null)
          this.removeMarker(id)
        }
      }
    },
    bulkRemove(ids: LocationData['id'][]) {
      this.search = this.search.filter(
        (search) => ids.includes(search.id) === false,
      )

      for (const [key, value] of Object.entries(this.markers)) {
        if (ids.includes(key)) {
          value.setMap(null)
          this.removeMarker(key)
        }
      }
    },
    addMarker(marker: google.maps.Marker, id: LocationData['id']) {
      this.markers[id] = marker
    },
    removeMarker(id: LocationData['id']) {
      delete this.markers[id]
    },
  },
})
