<template>
  <router-view v-if="isGoogleLoaded" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY
const loader = new Loader({
  apiKey,
  version: 'weekly',
  libraries: ['places'],
})

const isGoogleLoaded = ref(false)

const initGoogle = async () => {
  await loader.load()
  isGoogleLoaded.value = true
}

onMounted(() => {
  initGoogle()
})
</script>
