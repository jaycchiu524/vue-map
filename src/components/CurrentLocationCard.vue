<template>
  <v-card
    class="mx-auto d-flex text-start flex-column"
    max-width="500"
    :title="location?.name || 'Current Location'"
    :subtitle="location?.address || 'Current Location'">
    <v-card-text>
      <div class="tw-text-[48px] tw-leading-tight">{{ local.time }}</div>
      <div>{{ local.date }}</div>
    </v-card-text>
    <v-card-text>
      <div>
        <span class="font-weight-bold">UTC Time: </span>
        <span>{{ `${utc.date} ${utc.time}` }}</span>
      </div>
      <div>
        <span class="font-weight-bold">Time Zone: </span>
        <span>{{ timezone }}</span>
      </div>
      <div>
        <span class="font-weight-bold">Geolocation: </span>
        <span>{{
          location ? `${location?.lat}, ${location?.lng}` : 'N/A'
        }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { utcToZonedTime, format } from 'date-fns-tz'
import axios from 'axios'
import { LocationData } from './types'
import { PropType } from 'vue'
import { watch } from 'vue'

const getTimezone = async (lat: number, lng: number) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY

  if (!API_KEY) throw new Error('API_KEY is not defined')

  const timestamp = Math.floor(Date.now() / 1000)
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/timezone/json`,
    {
      params: {
        location: `${lat},${lng}`,
        timestamp,
        key: API_KEY,
      },
    },
  )
  return response.data
}

const props = defineProps<{
  location: LocationData | null
}>()

watch(
  () => props.location,
  () => {
    updateTimezone()
  },
)

const utc = ref(getUTCTime())
const local = ref(getLocalTime())
const timezone = ref('')

function getUTCTime() {
  const date = new Date()
  return {
    date: format(utcToZonedTime(date, 'UTC'), 'dd MMMM yyyy'),
    time: format(utcToZonedTime(date, 'UTC'), 'HH:mm:ss aaa'),
  }
}
function getLocalTime(timezone = 'America/Toronto') {
  const date = new Date()
  return {
    date: format(utcToZonedTime(date, timezone), 'dd MMMM yyyy (EEEE)'),
    time: format(utcToZonedTime(date, timezone), 'HH:mm:ss bb'),
  }
}

const updateTimezone = async () => {
  if (!props.location) return
  const { lat, lng } = props.location
  const { timeZoneId } = await getTimezone(lat!, lng!)
  timezone.value = timeZoneId
}

let intervalId: NodeJS.Timer

onMounted(() => {
  updateTimezone()
  intervalId = setInterval(() => {
    utc.value = getUTCTime()
    local.value = getLocalTime(timezone.value)
  }, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
<style lang=""></style>
