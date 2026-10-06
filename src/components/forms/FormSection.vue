<script setup>
import AppIcon from '@/components/common/AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  icon: { type: String, required: true },
})
</script>

<template>
  <section class="panel form-section">
    <div class="form-section-header">
      <span>
        <AppIcon :name="icon" />
      </span>
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
    </div>
    <div class="form-grid">
      <slot />
    </div>
  </section>
</template>
