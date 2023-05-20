<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <input ref="input" label="Search Places" />
      <CurrentLocationCard />
      <div ref="mapRef" style="height: 50vh" />
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, Ref } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import { Easing, Tween, update } from "@tweenjs/tween.js";
import { useSearchStore } from "@/store/search";
import CurrentLocationCard from "./CurrentLocationCard.vue";

const input: Ref<HTMLInputElement | null> = ref(null);
const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
const loader = new Loader({
  apiKey,
  version: "weekly",
  libraries: ["places"],
});

const searches = useSearchStore();
const mapRef: Ref<HTMLDivElement | null> = ref(null);
const map: Ref<google.maps.Map | null> = ref(null);

onMounted(async () => {
  const google = await loader.load();
  const toronto = new google.maps.LatLng(43.6532, -79.3832);
  const cameraOptions: google.maps.CameraOptions = {
    tilt: 0,
    heading: 0,
    zoom: 3,
    center: toronto,
  };
  map.value = new google.maps.Map(mapRef.value! as HTMLElement, {
    ...cameraOptions,
  });

  if (!map.value) return;

  new Tween(cameraOptions) // Create a new tween that modifies 'cameraOptions'.
    .to({ zoom: 12 }, 3000) // Move to destination in 15 second.
    .easing(Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    .onUpdate(() => {
      if (!map.value) return;
      map.value.moveCamera(cameraOptions);
    })
    .start(); // Start the tween immediately.

  const infowindow = new google.maps.InfoWindow();
  const autocomplete = new google.maps.places.Autocomplete(
    input.value as HTMLInputElement
  );

  const marker = new google.maps.Marker({
    position: toronto,
    title: "Toronto",
    map: map.value,
  });

  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (!map.value) return;
    if (place.geometry.viewport) {
      map.value.fitBounds(place.geometry.viewport);
    } else {
      map.value.setCenter(place.geometry.location);
      map.value.setZoom(17);
    }

    const id = searches.index.toString().padStart(2, "0");
    addMarker(place.geometry.location.toJSON(), map.value);

    if (place.name) {
      searches.addSearch({
        id: id,
        gid: place.place_id,
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  });
});

function animate(time: number) {
  requestAnimationFrame(animate);
  update(time);
}
// Adds a marker to the map.
function addMarker(location: google.maps.LatLngLiteral, map: google.maps.Map) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  const marker = new google.maps.Marker({
    position: location,
    label: searches.index.toString().padStart(2, "0"),
    map: map,
  });

  return marker;
}

requestAnimationFrame(animate);
defineExpose({ map, addMarker });
</script>
<style lang="scss" scoped>
input {
  box-sizing: border-box;
  min-width: min(100%, 300px);
  padding: 0.5rem 0.5rem;
  margin-bottom: 1rem;
  border-radius: 3px;
  border: 2px solid #00a0af;
  outline: none;
}
</style>
