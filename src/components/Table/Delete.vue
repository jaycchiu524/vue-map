<template>
  <v-tooltip :text="text" location="end">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        icon="mdi-delete"
        class="cursor-pointer"
        color="red darken-1"
        @click="() => emit('delete')" />
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
import { Row } from '@tanstack/vue-table'
import { computed } from 'vue'
import { LocationData } from '../types'

const props = defineProps({
  row: {
    type: Object as () => Row<LocationData>,
    required: true,
  },
})
const emit = defineEmits(['delete'])

const text = computed(() => {
  return `Delete ${props.row.original.name || 'this location'}`
})
</script>
<style lang=""></style>
