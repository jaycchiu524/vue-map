<template>
  <v-card v-if="!!location" :title="location.name" :subtitle="location.address">
    <v-card-text>
      <div>
        <span class="font-weight-bold">Local Time: </span>
        <span>
          {{ local }}
        </span>
      </div>
      <div>
        <span class="font-weight-bold">UTC Time: </span>
        <span>{{ utc }}</span>
      </div>
      <div v-if="!!timezone">
        <span class="font-weight-bold">Time Zone: </span>
        <span>{{ timezone }}</span>
      </div>
      <div>
        <span class="font-weight-bold">Geolocation: </span>
        <span>{{ `${location.lat}, ${location.lng}` }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { utcToZonedTime, format } from "date-fns-tz";
import axios from "axios";
import { LocationData } from "./types";
import { PropType } from "vue";

const getTimezone = async (lat: number, lng: number) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  if (!API_KEY) throw new Error("API_KEY is not defined");

  const timestamp = Math.floor(Date.now() / 1000);
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/timezone/json`,
    {
      params: {
        location: `${lat},${lng}`,
        timestamp,
        key: API_KEY,
      },
    }
  );

  return response.data;
};

const props = defineProps({
  location: {
    type: Object as PropType<LocationData>,
    required: true,
  },
});

const utc = ref(getUTCTime());
const local = ref(getLocalTime());
const timezone = ref("");
const location = computed(() => props.location);

watch(location, async (state) => {
  const tz = await getTimezone(state?.lat!, state?.lng!);
  timezone.value = tz.timeZoneId;
});

function getUTCTime() {
  const date = new Date();
  return format(utcToZonedTime(date, "UTC"), "yyyy-MM-dd HH:mm:ss");
}
function getLocalTime(timezone = "America/Toronto") {
  const date = new Date();
  return format(utcToZonedTime(date, timezone), "yyyy-MM-dd HH:mm:ss");
}

let intervalId: NodeJS.Timer;

onMounted(async () => {
  intervalId = setInterval(() => {
    utc.value = getUTCTime();
    local.value = getLocalTime(timezone.value);
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
<style lang=""></style>
