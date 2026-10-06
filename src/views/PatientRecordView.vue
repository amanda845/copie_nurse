<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppAvatar from '@/components/common/AppAvatar.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppButton from '@/components/common/AppButton.vue'

import RecordOverview from '@/components/records/RecordOverview.vue'
import TreatmentTimeline from '@/components/records/TreatmentTimeline.vue'
import Observations from '@/components/records/Observations.vue'
import RecordTransmissions from '@/components/records/RecordTransmissions.vue'

const router = useRouter()
const emit = defineEmits(['openModal'])

const tabs = ['Vue d’ensemble', 'Traitements', 'Observations', 'Transmissions']
const tab = ref('Vue d’ensemble')
</script>

<template>
  <div>
    <div class="record-header">
      <button class="back-button" @click="router.push({ name: 'patients' })">
        <AppIcon name="arrow" />
        Retour aux patients
      </button>
      <div class="record-main">
        <div class="record-identity">
          <AppAvatar initials="AM" tone="blue" large />
          <div>
            <div class="record-title">
              <h1>Amine Mansouri</h1>
              <AppBadge status="À surveiller" />
            </div>
            <p>
              DEM-2026-001 <i /> 27 ans <i /> Chambre 12 — Lit A
            </p>
          </div>
        </div>
        <div class="page-actions">
          <AppButton
            variant="secondary"
            icon="edit"
            @click="router.push({ name: 'patient-edit', params: { id: 'DEM-2026-001' } })"
          >
            Modifier
          </AppButton>
          <AppButton
            variant="secondary"
            icon="plus"
            @click="emit('openModal', 'observation')"
          >
            Observation
          </AppButton>
          <AppButton icon="message" @click="emit('openModal', 'transmission')">
            Transmission
          </AppButton>
        </div>
      </div>
      <div class="record-alert">
        <AppIcon name="alert" />
        <span>
          <strong>Patient à surveiller</strong> — Contrôle de la perfusion et
          de la douleur toutes les 2 heures.
        </span>
      </div>
      <div class="record-tabs">
        <button
          v-for="item in tabs"
          :key="item"
          :class="tab === item ? 'active' : ''"
          @click="tab = item"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <RecordOverview v-if="tab === 'Vue d’ensemble'" />
    <TreatmentTimeline v-if="tab === 'Traitements'" />
    <Observations v-if="tab === 'Observations'" />
    <RecordTransmissions v-if="tab === 'Transmissions'" @openModal="emit('openModal', 'transmission')" />
  </div>
</template>
