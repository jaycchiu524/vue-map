<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <GoogleMap ref="mapRef" />
      <CurrentLocationCard
        class="mb-4"
        v-if="!!search.current"
        :location="search.current" />
      <v-btn
        id="btn-get-current"
        :loading="isLoading"
        prepend-icon="mdi-map-marker"
        @click.prevent="getLocation"
        >Get Current Location</v-btn
      >
      <Table :key="key" :searches="search.search" />
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import GoogleMap from './GoogleMap.vue'
import { useSearchStore } from '@/store/search'
import Table from '@/components/Table/Table.vue'
import CurrentLocationCard from './CurrentLocationCard.vue'

const isLoading = ref(false)
const currentLocation = ref({ lat: 0, lng: 0 })
const mapRef = ref<null | InstanceType<typeof GoogleMap>>(null)

const search = useSearchStore()
const key = ref(0)

// Workaround to force re-render Table component
search.$subscribe((state) => {
  key.value = Math.random()
})

// // Get place predictions
// const getPlacePredictions = async (search: string) => {
//   const res = await autocompleteService.getPlacePredictions(
//     {
//       input: search,
//       types: ["establishment", "geocode"],
//     }
//     // callback
//   );
//   console.log(res);
// };

// // Get place details
// function getPlaceDetails(placeId: string) {
//   const request: google.maps.places.PlaceDetailsRequest = {
//     placeId: placeId,
//   };

//   placesService.getDetails(request, function (place, status) {
//     if (place && status === google.maps.places.PlacesServiceStatus.OK) {
//       const center = place.geometry?.location;
//       const marker = new google.maps.Marker({
//         position: center,
//         map: map,
//       });

//       if (center) map.setCenter(center);

//       // Hide autocomplete results
//       // results.style.display = "none";
//     }
//   });
// }

const getLocation = () => {
  isLoading.value = true
  const marker = mapRef.value?.marker
  if (!marker) return
  marker.setVisible(false)

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      const map = mapRef.value?.map

      marker.setPosition(currentLocation.value)
      marker.setVisible(true)

      if (!map) return
      map.panTo(currentLocation.value)
      isLoading.value = false
    })
  } else {
    alert('Geolocation is not supported by this browser.')
    isLoading.value = false
    marker.setVisible(true)
  }
}
</script>

<style scoped>
#btn-get-current {
  background: #f68c34;
  color: white;
  min-width: min(100%, 300px);
}
</style>
