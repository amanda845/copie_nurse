<script setup>
defineProps({
  time: { type: String, required: true },
  name: { type: String, required: true },
  nurse: { type: String, required: true },
  message: { type: String, required: true },
  unread: { type: Boolean, default: false },
  urgent: { type: Boolean, default: false },
})
</script>

<template>
  <div :class="`transmission-item ${unread ? 'unread' : ''}`">
    <div class="transmission-rail">
      <span :class="urgent ? 'urgent-dot' : ''" />
      <i />
    </div>
    <div class="transmission-content">
      <div>
        <strong>{{ name }}</strong>
        <time>{{ time }}</time>
      </div>
      <p>{{ message }}</p>
      <small>
        Par {{ nurse }}
        <b v-if="unread">À lire</b>
      </small>
    </div>
  </div>
</template>
