<script setup>
import AppIcon from '@/components/common/AppIcon.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: true },
  tone: { type: String, required: true },
})
</script>

<template>
  <div class="stat-card">
    <div :class="`stat-icon tone-${tone}`">
      <AppIcon :name="icon" />
    </div>
    <div class="stat-copy">
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
    </div>
  </div>
</template>
