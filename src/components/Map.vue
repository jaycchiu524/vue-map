<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <div>History: {{ JSON.stringify(searches.searches, null, 2) }}</div>
      <v-btn :loading="isLoading" @click.stop="getLocation">Get Location</v-btn>
      <GoogleMap ref="mapRef" />
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import GoogleMap from "./GoogleMap.vue";
import { onMounted } from "vue";
import { useSearchStore } from "@/store/app";

const isLoading = ref(false);
const currentLocation = ref({ lat: 0, lng: 0 });
const mapRef = ref<null | InstanceType<typeof GoogleMap>>(null);

const searches = useSearchStore();

onMounted(() => {});

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
  isLoading.value = true;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const map = mapRef.value?.map;
      const addMarker = mapRef.value?.addMarker;
      if (!map || !addMarker) return;
      map.panTo(currentLocation.value);
      addMarker(currentLocation.value, map);
      isLoading.value = false;
    });
  }
};
</script>
