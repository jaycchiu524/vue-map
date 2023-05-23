<template>
  <input ref="input" label="Search Places" :disabled="props.isFetching" />
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { ref } from 'vue'

const props = defineProps<{
  isFetching: boolean
}>()
const emit = defineEmits<{
  change: [place: google.maps.places.PlaceResult]
}>()

const countries = ref(['us', 'ca'])
const input = ref<HTMLInputElement | null>(null)

onMounted(() => {
  const autocomplete = new google.maps.places.Autocomplete(
    input.value as HTMLInputElement,
    {
      types: ['establishment', 'geocode'],
      componentRestrictions: {
        country: countries.value,
      },
    },
  )
  autocomplete.addListener('place_changed', () => {
    emit('change', autocomplete.getPlace())
  })
})
</script>
<style lang="scss" scoped>
input {
  box-sizing: border-box;
  min-width: min(100%, 500px);
  padding: 0.5rem 0.5rem;
  margin-bottom: 1rem;
  border-radius: 3px;
  border: 2px solid #00a0af;
  outline: none;
}
</style>
