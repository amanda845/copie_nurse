<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useFeedback } from '@/composables/useFeedback'

const { addFeedback } = useFeedback()

const isOpen = ref(false)
const sent = ref(false)
const sending = ref(false)

const CATEGORIES = ['Bug / Problème', 'Suggestion', 'Amélioration', 'Compliment', 'Autre']
const PAGES = ['Tableau de bord', 'Patients', 'Dossier patient', 'Traitements', 'Transmissions', 'Profil', 'Autre']

const form = ref({
  rating: 0,
  hoveredRating: 0,
  category: '',
  message: '',
  page: '',
})
const errors = ref({})

function reset() {
  form.value = { rating: 0, hoveredRating: 0, category: '', message: '', page: '' }
  errors.value = {}
  sent.value = false
}

function open() { isOpen.value = true; reset() }
function close() { isOpen.value = false; reset() }
function stopProp(e) { e.stopPropagation() }

function validate() {
  errors.value = {}
  if (!form.value.rating) errors.value.rating = 'Veuillez noter votre expérience'
  if (!form.value.category) errors.value.category = 'Choisissez une catégorie'
  if (!form.value.message.trim()) errors.value.message = 'Décrivez votre feedback'
  return !Object.keys(errors.value).length
}

async function submit() {
  if (!validate()) return
  sending.value = true
  await new Promise(r => setTimeout(r, 500))
  addFeedback({
    rating: form.value.rating,
    category: form.value.category,
    message: form.value.message,
    page: form.value.page,
  })
  sending.value = false
  sent.value = true
}

const starLabels = ['Très insatisfait', 'Insatisfait', 'Neutre', 'Satisfait', 'Très satisfait']
</script>

<template>
  <!-- Bouton flottant -->
  <button class="feedback-fab" @click="open" title="Donner mon avis">
    <AppIcon name="message" :size="20" />
    <span>Feedback</span>
  </button>

  <!-- Modale -->
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop feedback-backdrop" @mousedown="close">
      <div class="modal feedback-modal" @mousedown="stopProp">

        <!-- Succès -->
        <div v-if="sent" class="feedback-success">
          <div class="feedback-success-icon">
            <AppIcon name="check" :size="32" />
          </div>
          <h2>Merci pour votre retour !</h2>
          <p>Votre feedback a bien été envoyé et sera pris en compte pour améliorer NurseFlow.</p>
          <AppButton @click="close">Fermer</AppButton>
        </div>

        <!-- Formulaire -->
        <template v-else>
          <header>
            <div>
              <span><AppIcon name="message" /></span>
              <div>
                <h2>Votre avis</h2>
                <p>Aidez-nous à améliorer NurseFlow</p>
              </div>
            </div>
            <button type="button" class="icon-btn" @click="close">
              <AppIcon name="x" />
            </button>
          </header>

          <form class="modal-body feedback-form" @submit.prevent="submit">
            <!-- Note -->
            <div class="field">
              <span>Satisfaction globale <b>*</b></span>
              <div class="star-rating">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="star-btn"
                  :class="{ filled: n <= (form.hoveredRating || form.rating) }"
                  @mouseenter="form.hoveredRating = n"
                  @mouseleave="form.hoveredRating = 0"
                  @click="form.rating = n"
                >★</button>
              </div>
              <small v-if="form.rating" class="field-hint">
                {{ starLabels[form.rating - 1] }}
              </small>
              <small v-if="errors.rating" class="field-error">{{ errors.rating }}</small>
            </div>

            <!-- Catégorie -->
            <label class="field">
              <span>Catégorie <b>*</b></span>
              <select v-model="form.category">
                <option value="" disabled>Sélectionnez une catégorie</option>
                <option v-for="c in CATEGORIES" :key="c">{{ c }}</option>
              </select>
              <small v-if="errors.category" class="field-error">{{ errors.category }}</small>
            </label>

            <!-- Page concernée -->
            <label class="field">
              <span>Page concernée (optionnel)</span>
              <select v-model="form.page">
                <option value="">Non spécifié</option>
                <option v-for="p in PAGES" :key="p">{{ p }}</option>
              </select>
            </label>

            <!-- Message -->
            <label class="field field-full">
              <span>Votre feedback <b>*</b></span>
              <textarea
                v-model="form.message"
                placeholder="Décrivez votre expérience, ce qui fonctionne bien ou ce qui pourrait être amélioré…"
                style="min-height:100px"
              />
              <small v-if="errors.message" class="field-error">{{ errors.message }}</small>
            </label>

            <footer style="padding:0;background:none;border:0;justify-content:flex-end;display:flex;gap:8px">
              <AppButton variant="secondary" type="button" @click="close">Annuler</AppButton>
              <AppButton type="submit" icon="check">
                {{ sending ? 'Envoi en cours…' : 'Envoyer le feedback' }}
              </AppButton>
            </footer>
          </form>
        </template>

      </div>
    </div>
  </Teleport>
</template>
