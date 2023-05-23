<template>
  <v-checkbox v-model="value" color="primary" hide-details />
</template>
<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
</script>
<style lang=""></style>
