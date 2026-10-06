<script setup>
defineProps({
  initials: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: 'blue',
  },
  large: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <span :class="`avatar avatar-${tone} ${large ? 'avatar-large' : ''}`">
    {{ initials }}
  </span>
</template>
