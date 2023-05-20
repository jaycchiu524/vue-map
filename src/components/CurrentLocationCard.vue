<template>
  <v-card v-if="!!latest" :title="latest.name" :subtitle="latest.address">
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
        <span class="font-weight-bold">Latitude: </span>
        <span>{{ latest.lat }}</span>
      </div>
      <div>
        <span class="font-weight-bold">Longitude: </span>
        <span>{{ latest.lng }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { utcToZonedTime, format } from "date-fns-tz";
import { useSearchStore } from "@/store/search";
import axios from "axios";

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

const utc = ref(getUTCTime());
const local = ref(getLocalTime());
const search = useSearchStore();
const latest = computed(() => search.latest);
const timezone = ref("");

watch(latest, async (state) => {
  const { lat, lng } = state;
  const tz = await getTimezone(lat!, lng!);
  timezone.value = tz.timeZoneId;
});

function getUTCTime() {
  const date = new Date();
  return format(date, "yyyy-MM-dd HH:mm:ss");
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
