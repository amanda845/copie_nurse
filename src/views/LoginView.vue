<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLogo from '@/components/common/AppLogo.vue'
import { apiLogin, apiRegister } from '@/services/api'
import { useNurses } from '@/composables/useNurses'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { nurses, setActiveNurse } = useNurses()
const { notify } = useToast()

const mode = ref('login')
const loading = ref(false)
const errorMessage = ref('')
const form = ref({
  email: 'salima.mansouri@nurseflow.local',
  password: 'NurseFlow-ChangeMe!2026',
  name: '',
  role: 'Infirmier(e) DE',
  service: 'Service Médecine 2',
  badge: '',
})

function switchMode(nextMode) {
  mode.value = nextMode
  errorMessage.value = ''
  if (nextMode === 'login') {
    form.value.email = ''
    form.value.password = ''
  } else {
    form.value.email = ''
    form.value.password = ''
  }
}

async function submit() {
  errorMessage.value = ''
  loading.value = true
  try {
    const nurse = mode.value === 'login'
      ? await apiLogin(form.value.email, form.value.password)
      : await apiRegister(form.value)
    setActiveNurse(nurse.id)
    notify(`Bienvenue ${nurse.name} — session sécurisée ouverte`)
    router.push({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de joindre le serveur d’authentification.'
  } finally {
    loading.value = false
  }
}

function useSeedAccount() {
  form.value.email = 'salima.mansouri@nurseflow.local'
  form.value.password = 'NurseFlow-ChangeMe!2026'
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
        <AppIcon :name="mode === 'login' ? 'user' : 'users'" :size="28" />
      </div>
      <h1>{{ mode === 'login' ? 'Log in' : 'Sign in' }}</h1>
      <p>
        {{ mode === 'login'
          ? 'Connectez-vous pour accéder aux dossiers et signer vos actes infirmiers.'
          : 'Créez votre compte professionnel pour rejoindre l’équipe infirmière.' }}
      </p>

      <div class="filter-tabs" style="margin: 18px 0">
        <button :class="mode === 'login' ? 'active' : ''" type="button" @click="switchMode('login')">Log in</button>
        <button :class="mode === 'register' ? 'active' : ''" type="button" @click="switchMode('register')">Sign in</button>
      </div>

      <form class="add-nurse-box" style="display:flex;flex-direction:column;gap:12px" @submit.prevent="submit">
        <label class="field" v-if="mode === 'register'">
          <span>Nom complet *</span>
          <input v-model="form.name" placeholder="Ex : Sarah Alami" required />
        </label>
        <label class="field">
          <span>Email professionnel *</span>
          <input v-model="form.email" type="email" autocomplete="email" placeholder="prenom.nom@hopital.dz" required />
        </label>
        <label class="field">
          <span>Mot de passe *</span>
          <input v-model="form.password" type="password" autocomplete="current-password" minlength="8" placeholder="8 caractères minimum" required />
        </label>
        <template v-if="mode === 'register'">
          <div class="grid-2">
            <label class="field">
              <span>Rôle</span>
              <select v-model="form.role">
                <option>Infirmier(e) DE</option>
                <option>Infirmier(e) DE (Nuit)</option>
                <option>Cadre de santé</option>
                <option>Aide-soignant(e)</option>
              </select>
            </label>
            <label class="field">
              <span>Service</span>
              <input v-model="form.service" required />
            </label>
          </div>
          <label class="field">
            <span>Matricule / Badge *</span>
            <input v-model="form.badge" placeholder="Ex : BADGE-055" required />
          </label>
        </template>

        <div v-if="errorMessage" class="field-error" role="alert">{{ errorMessage }}</div>
        <AppButton type="submit" icon="check" :disabled="loading" style="width:100%;justify-content:center">
          {{ loading ? 'Connexion sécurisée…' : mode === 'login' ? 'Log in' : 'Sign in' }}
        </AppButton>
      </form>

      <button v-if="mode === 'login'" class="btn-toggle-add-nurse" type="button" @click="useSeedAccount">
        Utiliser le compte de démonstration infirmier
      </button>

      <div class="secure-text">
        <AppIcon name="shield" :size="14" style="color:var(--green)" />
        Chaque modification est signée par l’utilisateur connecté et enregistrée dans le journal serveur.
      </div>
    </div>

    <footer>NurseFlow · Authentification et traçabilité des soins</footer>
  </div>
</template>
