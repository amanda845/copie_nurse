<script setup>
defineProps({
  size: {
    type: Number,
    default: 42,
  },
})
</script>

<template>
  <svg
    class="app-logo"
    :width="size"
    :height="size"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Logo NurseFlow"
  >
    <path d="M50 120C50 108.954 58.9543 100 70 100H150L180 130H330C341.046 130 350 138.954 350 150V300C350 311.046 341.046 320 330 320H70C58.9543 320 50 311.046 50 300V120Z" fill="#e0f2fe"/>
    <path d="M40 160C40 148.954 48.9543 140 60 140H340C351.046 140 360 148.954 360 160V310C360 321.046 351.046 330 340 330H60C48.9543 330 40 321.046 40 310V160Z" fill="white" stroke="#0284c7" stroke-width="8" stroke-linejoin="round"/>
    <rect x="90" y="190" width="180" height="12" rx="6" fill="#f1f5f9"/>
    <rect x="90" y="220" width="140" height="12" rx="6" fill="#f1f5f9"/>
    <circle cx="280" cy="240" r="45" fill="#0284c7"/>
    <path d="M280 215V265M255 240H305" stroke="white" stroke-width="12" stroke-linecap="round"/>
    <path d="M90 280L130 280L145 250L170 310L190 280L230 280" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="340" cy="90" r="15" fill="#0ea5e9"/>
    <circle cx="80" cy="70" r="10" fill="#bae6fd"/>
    <circle cx="40" cy="200" r="8" fill="#bae6fd"/>
  </svg>
</template>
