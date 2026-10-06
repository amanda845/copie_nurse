<script setup>
import AppBadge from '@/components/common/AppBadge.vue'
import AppButton from '@/components/common/AppButton.vue'

const emit = defineEmits(['openModal'])
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h2>Transmissions infirmières</h2>
        <p>Informations partagées concernant Amine Mansouri</p>
      </div>
      <AppButton icon="plus" @click="emit('openModal')">
        Nouvelle transmission
      </AppButton>
    </div>
    <div class="transmission-table">
      <div class="transmission-table-row head">
        <span>Heure</span>
        <span>Infirmière</span>
        <span>Message</span>
        <span>Statut</span>
      </div>
      <div class="transmission-table-row">
        <strong>19:10</strong>
        <span>Salima Msdn</span>
        <p>État stable, continuer surveillance de la perfusion.</p>
        <AppBadge status="Lue" />
      </div>
      <div class="transmission-table-row">
        <strong>18:30</strong>
        <span>Amel K.</span>
        <p>Douleur signalée, réévaluation nécessaire à 20:00.</p>
        <AppBadge status="À lire" />
      </div>
    </div>
  </section>
</template>
