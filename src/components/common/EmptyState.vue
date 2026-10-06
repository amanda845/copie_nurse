<script setup>
import AppIcon from './AppIcon.vue'
</script>

<template>
  <div class="empty-state">
    <span>
      <AppIcon name="search" :size="28" />
    </span>
    <h3>Aucun patient trouvé</h3>
    <p>Modifiez votre recherche ou choisissez un autre filtre.</p>
  </div>
</template>
