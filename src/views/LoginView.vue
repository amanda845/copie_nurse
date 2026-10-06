<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppAvatar from '@/components/common/AppAvatar.vue'
import AppLogo from '@/components/common/AppLogo.vue'
import { useNurses } from '@/composables/useNurses'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { nurses, activeNurse, setActiveNurse, addNurse } = useNurses()
const { notify } = useToast()

const showAddNurse = ref(false)
const newName = ref('')
const newRole = ref('Infirmier(e) DE')
const newService = ref('Service Médecine 2')
const newBadge = ref('')

function pickNurseAndEnter(nurse) {
  setActiveNurse(nurse.id)
  notify(`Bienvenue ${nurse.name} — Prise de service validée`)
  router.push({ name: 'dashboard' })
}

function enterDirectly() {
  notify(`Accès direct aux dossiers — Connecté en tant que ${activeNurse.value.name}`)
  router.push({ name: 'dashboard' })
}

function handleAddNurse() {
  if (!newName.value.trim()) return
  const created = addNurse({
    name: newName.value,
    role: newRole.value,
    service: newService.value,
    badge: newBadge.value,
  })
  setActiveNurse(created.id)
  notify(`Infirmier(e) ${created.name} enregistré(e) avec succès`)
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="login-page">
    <div class="login-decoration one" />
    <div class="login-decoration two" />
    
    <div class="login-brand">
      <AppLogo :size="64" />
      <span class="nurseflow-name">
        <span>Nurse <span class="nurseflow-flow">Flow</span></span>
        <small>Dossier Électronique Médical — Service infirmier hospitalier</small>
      </span>
    </div>

    <div class="login-card hospital-shift-card">
      <div class="login-icon">
        <AppIcon name="users" :size="28" />
      </div>
      <h1>Prise de poste soignante</h1>
      <p>Sélectionnez votre profil ou enregistrez-vous pour signer vos soins et consultations.</p>

      <!-- Équipe hospitalière enregistrée -->
      <div class="shift-nurses-list">
        <div
          v-for="n in nurses"
          :key="n.id"
          :class="['shift-nurse-card', n.id === activeNurse.id ? 'active-shift' : '']"
          @click="pickNurseAndEnter(n)"
        >
          <AppAvatar :initials="n.initials" :tone="n.tone" large />
          <div class="snc-info">
            <div style="display:flex;align-items:center;gap:6px">
              <strong>{{ n.name }}</strong>
              <span v-if="n.id === activeNurse.id" class="badge-active-mini">En poste</span>
            </div>
            <small>{{ n.role }} · {{ n.service }}</small>
            <span class="snc-badge">{{ n.badge }}</span>
          </div>
          <button type="button" class="btn-shift-action">
            Prendre le poste <AppIcon name="arrow" :size="14" />
          </button>
        </div>
      </div>

      <!-- Formulaire d'ajout si nouvelle infirmière -->
      <div v-if="showAddNurse" class="add-nurse-box">
        <h3>Enregistrer un(e) soignant(e) dans l'hôpital</h3>
        <form @submit.prevent="handleAddNurse">
          <label class="field">
            <span>Nom complet *</span>
            <input v-model="newName" placeholder="Ex : Sarah Alami" required />
          </label>
          <div class="grid-2">
            <label class="field">
              <span>Rôle</span>
              <select v-model="newRole">
                <option>Infirmier(e) DE</option>
                <option>Infirmier(e) DE (Nuit)</option>
                <option>Cadre de santé</option>
                <option>Aide-soignant(e)</option>
              </select>
            </label>
            <label class="field">
              <span>Service</span>
              <input v-model="newService" placeholder="Ex : Médecine 2" />
            </label>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
            <AppButton variant="secondary" type="button" @click="showAddNurse = false">Annuler</AppButton>
            <AppButton type="submit" icon="check">Valider et entrer</AppButton>
          </div>
        </form>
      </div>

      <!-- Actions rapides en bas de carte -->
      <div class="login-shift-actions">
        <button
          v-if="!showAddNurse"
          type="button"
          class="btn-toggle-add-nurse"
          @click="showAddNurse = true"
        >
          <AppIcon name="plus" :size="15" />
          Nouvel(le) infirmier(e) ? Enregistrer mon profil
        </button>

        <AppButton class="full-button" variant="secondary" @click="enterDirectly">
          Accéder directement sans changer de profil
          <AppIcon name="arrow" :size="16" />
        </AppButton>
      </div>

      <div class="secure-text">
        <AppIcon name="check" :size="14" style="color:var(--green)" />
        Toutes les modifications et administrations de soins porteront le nom du soignant sélectionné.
      </div>
    </div>

    <footer>NurseFlow · Réseau hospitalier privé — Traçabilité soignante garantie</footer>
  </div>
</template>
