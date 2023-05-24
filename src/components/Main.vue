<template>
  <div class="tw-sticky tw-top-[64px] tw-left-0 tw-right-0 tw-z-10">
    <GoogleMap
      :center="currentLocation"
      :markers="search.markers"
      ref="mapRef" />
  </div>
  <v-container class="">
    <v-responsive class="align-center text-center">
      <v-btn
        class="bg-amber"
        id="btn-get-current"
        :loading="isLoading"
        prepend-icon="mdi-map-marker"
        @click.prevent="getLocation"
        >Get Current Location</v-btn
      >
      <div class="my-4">
        <SearchInput @change="handleSearch" :is-fetching="isFetching" />
      </div>
      <CurrentLocationCard class="my-4" :location="search.current" />

      <Table
        class="my-4"
        :search="search.search"
        @remove="handleRemove"
        @bulk-remove="handleBulkRemove" />
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import GoogleMap from './GoogleMap.vue'
import { useSearchStore } from '@/store/search'
import Table from '@/components/Table/Table.vue'
import CurrentLocationCard from './CurrentLocationCard.vue'
import SearchInput from './SearchInput.vue'
import { toRaw } from 'vue'

const isLoading = ref(false)
const isFetching = ref(false)
const currentLocation = ref(new google.maps.LatLng(43.6532, -79.3832)) // Toronto
const mapRef = ref<null | InstanceType<typeof GoogleMap>>(null)
const search = useSearchStore()

const handleRemove = (id: string) => {
  const c = confirm('Are you sure you want to delete this search?')
  if (!c) return
  toRaw(search.markers[id]).setMap(null)
  search.remove(id)
}

const handleBulkRemove = (ids: string[]) => {
  const c = confirm('Are you sure you want to delete these searches?')
  if (!c) return
  ids.forEach((id) => {
    toRaw(search.markers[id]).setMap(null)
  })
  search.bulkRemove(ids)
}

const handleSearch = (place: google.maps.places.PlaceResult) => {
  const map = mapRef.value?.map
  if (!place.geometry || !place.geometry.location) {
    // User entered the name of a Place that was not suggested and
    // pressed the Enter key, or the Place Details request failed.
    window.alert("No details available for input: '" + place.name + "'")
    isFetching.value = false
    return
  }

  // If the place has a geometry, then present it on a map.
  if (!map) {
    isFetching.value = false
    return
  }

  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport)
  } else {
    map.setCenter(place.geometry.location)
    map.setZoom(17)
  }

  const id = search.index.toString().padStart(2, '0')
  const m = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    label: id,
  })

  search.addMarker(m, id)

  if (place.name) {
    search.add({
      id: id,
      gid: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    })
  }

  isFetching.value = false
}

const getLocation = () => {
  isLoading.value = true

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentLocation.value = new google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude,
      )

      isLoading.value = false
    })
  } else {
    alert('Geolocation is not supported by this browser.')
    isLoading.value = false
  }
}
</script>

<style scoped></style>
