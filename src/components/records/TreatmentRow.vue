<script setup>
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  treatment: { type: Object, required: true },
  allHours: { type: Array, required: true },
  editable: { type: Boolean, default: true },
})

const emit = defineEmits(['clickDose', 'edit', 'delete'])

function doseStatus(hour) {
  if (!props.treatment.scheduled.includes(hour)) return null
  const admin = props.treatment.administrations[hour]
  if (!admin) return 'pending'
  return admin.status
}

function doseClass(hour) {
  const s = doseStatus(hour)
  if (!s) return ''
  if (s === 'done') return 'dose done'
  if (s === 'skipped') return 'dose skipped'
  if (s === 'cancelled') return 'dose cancelled'
  if (s === 'refused') return 'dose refused'
  // pending / next
  const currentHour = String(new Date().getHours()).padStart(2, '0')
  return hour === currentHour ? 'dose next' : 'dose pending'
}

function getCheckedBy(hour) {
  return props.treatment.administrations[hour]?.by || ''
}

function formatNurseName(name) {
  if (!name) return ''
  const trimmed = name.trim()
  const parts = trimmed.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}.${parts[parts.length - 1]}`
  }
  return trimmed
}
</script>

<template>
  <div class="treatment-row">
    <!-- Nom + info + actions -->
    <div
      class="treatment-row-info"
      :title="editable ? 'Cliquer pour modifier ce traitement' : ''"
      :style="editable ? 'cursor: pointer;' : ''"
      @click="editable && emit('edit', treatment)"
    >
      <strong>{{ treatment.name }}</strong>
      <small>{{ treatment.dosage }} · {{ treatment.route }}</small>
      <div v-if="editable" class="treatment-row-actions">
        <button
          type="button"
          class="tr-action-btn"
          title="Modifier le traitement"
          @click.stop="emit('edit', treatment)"
        >
          <AppIcon name="edit" :size="12" />
        </button>
        <button
          type="button"
          class="tr-action-btn tr-action-danger"
          title="Supprimer le traitement"
          @click.stop="emit('delete', treatment)"
        >
          <AppIcon name="x" :size="12" />
        </button>
      </div>
    </div>

    <!-- Cellules horaires -->
    <span v-for="hour in allHours" :key="hour" class="dose-cell">
      <button
        v-if="treatment.scheduled.includes(hour)"
        :class="doseClass(hour)"
        :disabled="!editable"
        :title="`${treatment.name} à ${hour}h : ${doseStatus(hour) === 'done' ? 'Administré' : doseStatus(hour) === 'skipped' ? 'Reporté' : doseStatus(hour) === 'cancelled' ? 'Annulé' : 'Planifié'} (cliquer pour modifier)`"
        @click.stop="editable && emit('clickDose', { treatment, hour })"
      >
        <AppIcon v-if="doseStatus(hour) === 'done'" name="check" :size="13" />
        <AppIcon v-else-if="doseStatus(hour) === 'skipped'" name="clock" :size="11" />
        <AppIcon v-else-if="doseStatus(hour) === 'cancelled' || doseStatus(hour) === 'refused'" name="x" :size="11" />
        <i v-else />
      </button>

      <!-- Slot vide cliquable pour ajouter une administration ou prise à cette heure -->
      <button
        v-else-if="editable"
        class="dose dose-add-slot"
        :title="`Planifier ou administrer ${treatment.name} à ${hour}h`"
        @click.stop="emit('clickDose', { treatment, hour })"
      >
        <AppIcon name="plus" :size="10" />
      </button>

      <small
        v-if="treatment.scheduled.includes(hour) && getCheckedBy(hour)"
        class="checked-by"
        :title="`Administré par ${getCheckedBy(hour)} à ${treatment.administrations[hour]?.at || hour + 'h'}`"
      >{{ formatNurseName(getCheckedBy(hour)) }}</small>
    </span>
  </div>
</template>
