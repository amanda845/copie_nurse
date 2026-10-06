<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '-')
}
</script>

<template>
  <span :class="`badge badge-${normalize(status)}`">
    {{ status }}
  </span>
</template>
