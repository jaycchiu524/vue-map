<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <div class="mb-4" ref="mapRef" style="height: 50vh" />
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, Ref } from 'vue'
import { Easing, Tween, update } from '@tweenjs/tween.js'
import { watch } from 'vue'

const props = defineProps({
  center: {
    type: google.maps.LatLng,
    required: true,
  },
})

const mapRef: Ref<HTMLDivElement | null> = ref(null)
const map: Ref<google.maps.Map | null> = ref(null)
const infowindow: Ref<google.maps.InfoWindow | null> = ref(null)
const marker = ref<google.maps.Marker | null>(null)

watch(
  () => props.center, // watch for changes in props.center
  () => {
    if (!map.value) return
    map.value.panTo(props.center)
    marker.value?.setPosition(props.center)
  },
)

onMounted(() => {
  const cameraOptions: google.maps.CameraOptions = {
    tilt: 0,
    heading: 0,
    zoom: 3,
    center: props.center,
  }

  map.value = new google.maps.Map(mapRef.value as HTMLElement, {
    ...cameraOptions,
  })

  if (!map.value) return

  marker.value = new google.maps.Marker({
    position: props.center,
    map: map.value,
    title: 'Your Location',
  })
  marker.value.setPosition(props.center)
  marker.value.setVisible(true)

  new Tween(cameraOptions) // Create a new tween that modifies 'cameraOptions'.
    .to({ zoom: 12 }, 3000) // Move to destination in 15 second.
    .easing(Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    .onUpdate(() => {
      if (!map.value) return
      map.value.moveCamera(cameraOptions)
    })
    .start() // Start the tween immediately.

  infowindow.value = new google.maps.InfoWindow()
})

function animate(time: number) {
  requestAnimationFrame(animate)
  update(time)
}

requestAnimationFrame(animate)
defineExpose({ map })
</script>
<style lang="scss" scoped></style>
