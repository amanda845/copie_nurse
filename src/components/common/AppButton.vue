<script setup>
import AppIcon from './AppIcon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  icon: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'button',
  },
  class: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :class="`btn btn-${variant} ${props.class}`"
    @click="emit('click')"
  >
    <AppIcon v-if="icon" :name="icon" :size="18" />
    <span><slot /></span>
  </button>
</template>
