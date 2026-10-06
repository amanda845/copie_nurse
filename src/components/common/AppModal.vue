<script setup>
import AppIcon from './AppIcon.vue'
import AppButton from './AppButton.vue'
import AppSelect from '@/components/forms/AppSelect.vue'
import { ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true, // 'observation' | 'transmission'
  },
})

const emit = defineEmits(['close', 'submit'])

const priority = ref('Normale')
const text = ref('')
const checkboxChecked = ref(true)

function submit(e) {
  e.preventDefault()
  emit('submit', props.type)
  closeModal()
}

function closeModal() {
  emit('close')
}

function onBackdropMousedown() {
  closeModal()
}

function stopPropagation(e) {
  e.stopPropagation()
}
</script>

<template>
  <div class="modal-backdrop" @mousedown="onBackdropMousedown">
    <form class="modal" @submit.prevent="submit" @mousedown="stopPropagation">
      <header>
        <div>
          <span>
            <AppIcon :name="type === 'observation' ? 'file' : 'message'" />
          </span>
          <div>
            <h2>{{ type === 'observation' ? 'Nouvelle observation' : 'Nouvelle transmission' }}</h2>
            <p>Amine Mansouri · Chambre 12 — Lit A</p>
          </div>
        </div>
        <button type="button" class="icon-btn" @click="closeModal">
          <AppIcon name="x" />
        </button>
      </header>
      <div class="modal-body">
        <AppSelect
          v-if="type === 'transmission'"
          label="Priorité"
          :options="['Normale', 'Urgente']"
          v-model="priority"
        />
        <label class="field field-full">
          <span>{{ type === 'observation' ? 'Observation clinique' : 'Message à transmettre' }}</span>
          <textarea
            v-model="text"
            autofocus
            :placeholder="type === 'observation'
              ? 'Décrivez l\'état du patient et les éléments observés...'
              : 'Saisissez les informations importantes pour l\'équipe suivante...'"
            required
          />
        </label>
        <label class="checkbox-row">
          <input type="checkbox" v-model="checkboxChecked" />
          <span>{{ type === 'observation' ? "Ajouter à l'historique du patient" : "Notifier l'équipe de relève" }}</span>
        </label>
      </div>
      <footer>
        <AppButton variant="secondary" @click="closeModal">Annuler</AppButton>
        <AppButton type="submit" icon="check">
          {{ type === 'observation' ? "Ajouter l'observation" : 'Partager la transmission' }}
        </AppButton>
      </footer>
    </form>
  </div>
</template>
