<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useTreatments } from '@/composables/useTreatments'

const { ROUTES, HOURS_24 } = useTreatments()

const props = defineProps({
  mode: { type: String, default: 'add' }, // 'add' | 'edit'
  treatment: { type: Object, default: null },
})
const emit = defineEmits(['close', 'submit'])

const form = ref({
  name: '',
  dosage: '',
  route: 'IV',
  scheduled: [],
})
const errors = ref({})
const saving = ref(false)

watch(() => props.treatment, (t) => {
  if (t && props.mode === 'edit') {
    form.value = {
      name: t.name,
      dosage: t.dosage,
      route: t.route,
      scheduled: [...t.scheduled],
    }
  } else {
    form.value = { name: '', dosage: '', route: 'IV', scheduled: [] }
  }
}, { immediate: true })

function toggleHour(h) {
  const idx = form.value.scheduled.indexOf(h)
  if (idx > -1) form.value.scheduled.splice(idx, 1)
  else form.value.scheduled.push(h)
}

function validate() {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Le nom est requis'
  if (!form.value.dosage.trim()) errors.value.dosage = 'Le dosage est requis'
  if (form.value.scheduled.length === 0) errors.value.scheduled = 'Sélectionnez au moins une heure'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  emit('submit', { ...form.value })
  saving.value = false
}

function close() { emit('close') }
function stopProp(e) { e.stopPropagation() }
</script>

<template>
  <div class="modal-backdrop" @mousedown="close">
    <form class="modal treatment-modal" @submit.prevent="submit" @mousedown="stopProp">
      <header>
        <div>
          <span><AppIcon name="pill" /></span>
          <div>
            <h2>{{ mode === 'add' ? 'Nouveau traitement' : 'Modifier le traitement' }}</h2>
            <p>Amine Mansouri · Chambre 12 — Lit A</p>
          </div>
        </div>
        <button type="button" class="icon-btn" @click="close">
          <AppIcon name="x" />
        </button>
      </header>

      <div class="modal-body">
        <!-- Nom -->
        <label class="field">
          <span>Médicament <b>*</b></span>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ex : Paracétamol, Amoxicilline…"
            autofocus
          />
          <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
        </label>

        <!-- Dosage + Voie -->
        <div class="modal-row2">
          <label class="field">
            <span>Dosage <b>*</b></span>
            <input v-model="form.dosage" type="text" placeholder="Ex : 1 g, 500 mg, 500 ml" />
            <small v-if="errors.dosage" class="field-error">{{ errors.dosage }}</small>
          </label>
          <label class="field">
            <span>Voie d'administration</span>
            <select v-model="form.route">
              <option v-for="r in ROUTES" :key="r">{{ r }}</option>
            </select>
          </label>
        </div>

        <!-- Heures -->
        <div class="field">
          <span>Heures d'administration <b>*</b></span>
          <div class="hour-picker">
            <button
              v-for="h in HOURS_24"
              :key="h"
              type="button"
              :class="['hour-btn', form.scheduled.includes(h) ? 'selected' : '']"
              @click="toggleHour(h)"
            >{{ h }}</button>
          </div>
          <small v-if="errors.scheduled" class="field-error">{{ errors.scheduled }}</small>
          <small v-if="form.scheduled.length > 0" class="field-hint">
            {{ form.scheduled.length }} heure(s) sélectionnée(s) :
            {{ form.scheduled.slice().sort().join(', ') }}h
          </small>
        </div>
      </div>

      <footer>
        <AppButton variant="secondary" @click="close">Annuler</AppButton>
        <AppButton type="submit" icon="check" :class="saving ? 'btn-loading' : ''">
          {{ saving ? 'Enregistrement…' : (mode === 'add' ? 'Ajouter le traitement' : 'Enregistrer') }}
        </AppButton>
      </footer>
    </form>
  </div>
</template>
