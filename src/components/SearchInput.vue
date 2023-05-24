<template>
  <div id="container" class="tw-flex tw-flex-col tw-mx-auto">
    <input ref="input" label="Search Places" :disabled="props.isFetching" />
    <v-row>
      <v-col>
        <v-checkbox
          direction="horizontal"
          density="compact"
          v-model="countries"
          value="us"
          label="US Only"></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          density="compact"
          v-model="countries"
          value="ca"
          label="Canada Only"></v-checkbox>
      </v-col>
    </v-row>
  </div>
</template>
<script setup lang="ts">
import { watch } from 'vue'
import { onMounted } from 'vue'
import { ref } from 'vue'

const props = defineProps<{
  isFetching: boolean
}>()
const emit = defineEmits<{
  change: [place: google.maps.places.PlaceResult]
}>()

const countries = ref(['us', 'ca'])
const autocomplete = ref<google.maps.places.Autocomplete | null>(null)
const input = ref<HTMLInputElement | null>(null)

watch(
  () => countries.value,
  () => {
    if (!autocomplete.value) return
    autocomplete.value.setComponentRestrictions({
      country: countries.value,
    })
  },
)

onMounted(() => {
  autocomplete.value = new google.maps.places.Autocomplete(
    input.value as HTMLInputElement,
    {
      types: ['establishment', 'geocode'],
      componentRestrictions: {
        country: countries.value,
      },
    },
  )
  autocomplete.value.addListener('place_changed', () => {
    if (!autocomplete.value) return
    emit('change', autocomplete.value.getPlace())
  })
})
</script>
<style lang="scss" scoped>
#container {
  width: min(100%, 500px);
}
input {
  box-sizing: border-box;
  padding: 0.5rem 0.5rem;
  border-radius: 3px;
  border: 2px solid #00a0af;
  outline: none;
}
</style>
