<script setup>
import { useRouter } from 'vue-router'
import AppAvatar from '@/components/common/AppAvatar.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()

const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Patient</th>
          <th>Âge</th>
          <th>Chambre</th>
          <th>Lit</th>
          <th>État</th>
          <th>Dernière mise à jour</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in rows" :key="patient.id">
          <td data-label="Patient">
            <div class="patient-cell">
              <AppAvatar :initials="patient.initials" :tone="patient.tone" />
              <span>
                <strong>{{ patient.name }}</strong>
                <small>{{ patient.id }}</small>
              </span>
            </div>
          </td>
          <td data-label="Âge">{{ patient.age }} ans</td>
          <td data-label="Chambre"><strong>{{ patient.room }}</strong></td>
          <td data-label="Lit">{{ patient.bed }}</td>
          <td data-label="État">
            <AppBadge :status="patient.status" />
          </td>
          <td data-label="Mise à jour">
            <span class="muted-with-icon">
              <AppIcon name="clock" :size="15" />
              {{ patient.updated }}
            </span>
          </td>
          <td class="row-actions">
            <AppButton
              variant="ghost"
              @click="router.push({ name: 'patient-record', params: { id: patient.id } })"
            >
              Voir <AppIcon name="arrow" :size="15" />
            </AppButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
