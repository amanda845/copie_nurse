<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  emphasis: { type: Boolean, default: false },
})
</script>

<template>
  <div class="info-row">
    <span>{{ label }}</span>
    <strong :class="emphasis ? 'danger-text' : ''">{{ value }}</strong>
  </div>
</template>
