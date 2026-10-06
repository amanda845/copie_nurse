<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppAvatar from '@/components/common/AppAvatar.vue'
import { useTreatments } from '@/composables/useTreatments'
import { useNurses } from '@/composables/useNurses'

const { ADMIN_STATUSES } = useTreatments()
const { nurses, activeNurse } = useNurses()

const props = defineProps({
  treatment: { type: Object, required: true },
  hour: { type: String, required: true },
})
const emit = defineEmits(['close', 'submit'])

const currentAdmin = computed(() => props.treatment?.administrations?.[props.hour])
const selectedStatus = ref(currentAdmin.value?.status || 'done')
const selectedNurseId = ref(activeNurse.value.id)
const note = ref(currentAdmin.value?.note || '')
const saving = ref(false)

watch(() => [props.treatment, props.hour], () => {
  const a = props.treatment?.administrations?.[props.hour]
  selectedStatus.value = a?.status || 'done'
  note.value = a?.note || ''
  // Si déjà administré par quelqu'un, trouver l'id correspondant ou garder l'infirmière active
  if (a?.by) {
    const found = nurses.value.find(n => n.name === a.by || n.shortName === a.by)
    if (found) selectedNurseId.value = found.id
  } else {
    selectedNurseId.value = activeNurse.value.id
  }
}, { immediate: true })

async function submit() {
  saving.value = true
  await new Promise(r => setTimeout(r, 180))
  const nurseObj = nurses.value.find(n => n.id === selectedNurseId.value) || activeNurse.value
  emit('submit', {
    status: selectedStatus.value,
    note: note.value,
    nurse: nurseObj.shortName || nurseObj.name,
    nurseId: nurseObj.id,
    nurseFullName: nurseObj.name,
  })
  saving.value = false
}

function remove() { emit('submit', { status: null }) }
function close() { emit('close') }
function stopProp(e) { e.stopPropagation() }
</script>

<template>
  <div class="modal-backdrop" @mousedown="close">
    <form class="modal admin-modal" @submit.prevent="submit" @mousedown="stopProp">
      <header>
        <div>
          <span><AppIcon name="check" /></span>
          <div>
            <h2>Administration · {{ hour }}h</h2>
            <p>{{ treatment.name }} · {{ treatment.dosage }} · {{ treatment.route }}</p>
          </div>
        </div>
        <button type="button" class="icon-btn" @click="close">
          <AppIcon name="x" />
        </button>
      </header>

      <div class="modal-body">
        <!-- Soignant réalisant l'acte -->
        <div class="field">
          <span>Soignant réalisant l'administration</span>
          <div class="nurse-selector-box">
            <select v-model="selectedNurseId" class="nurse-select-input">
              <option v-for="n in nurses" :key="n.id" :value="n.id">
                {{ n.name }} ({{ n.role }}) — {{ n.service }}
              </option>
            </select>
            <small class="field-hint">
              Le nom du soignant sélectionné sera affiché sous la prise dans le planning.
            </small>
          </div>
        </div>

        <!-- Choix du statut -->
        <div class="field">
          <span>Statut de l'administration</span>
          <div class="status-picker">
            <button
              v-for="s in ADMIN_STATUSES"
              :key="s.value"
              type="button"
              :class="['status-btn', selectedStatus === s.value ? 'selected' : '']"
              :style="selectedStatus === s.value ? `--sc: ${s.color}` : ''"
              @click="selectedStatus = s.value"
            >
              <i :style="`background:${s.color}`" />
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Remarque / motif -->
        <label class="field">
          <span>Remarque ou motif (optionnel)</span>
          <textarea
            v-model="note"
            placeholder="Ex : Patient endormi, prise reportée de 30 min, perfusion bien tolérée…"
            style="min-height:72px"
          />
        </label>

        <!-- Info existante si déjà enregistré -->
        <div v-if="currentAdmin" class="admin-current-info">
          <AppIcon name="check" :size="13" />
          Dernier enregistrement par <strong>{{ currentAdmin.by }}</strong> à {{ currentAdmin.at }}
        </div>
      </div>

      <footer>
        <AppButton v-if="currentAdmin" variant="danger" type="button" @click="remove">
          Effacer la prise
        </AppButton>
        <AppButton variant="secondary" type="button" @click="close">Annuler</AppButton>
        <AppButton type="submit" icon="check">
          {{ saving ? 'Enregistrement…' : 'Valider l\'administration' }}
        </AppButton>
      </footer>
    </form>
  </div>
</template>
