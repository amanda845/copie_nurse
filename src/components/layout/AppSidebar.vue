<script setup>
import { useRouter, useRoute } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppLogo from '@/components/common/AppLogo.vue'
import { useNurses } from '@/composables/useNurses'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()
const route = useRoute()
const { activeNurse } = useNurses()

const navItems = [
  { name: 'dashboard',      label: 'Accueil',                 icon: 'home' },
  { name: 'patients',       label: 'Mes patients',             icon: 'users' },
  { name: 'patients-add',   label: 'Nouveau dossier',          icon: 'plus' },
  { name: 'diagnostics',    label: 'Diagnostics infirmiers',   icon: 'stethoscope' },
  { name: 'patient-record', label: 'Soins & Interventions',    icon: 'cross' },
  { name: 'transmissions',  label: 'Transmissions',            icon: 'message' },
  { name: 'profile',        label: 'Évaluations & Activités',  icon: 'activity' },
]

function isActive(name) {
  if (name === 'patient-record') {
    return route.name === 'patient-record' || route.name === 'patient-edit'
  }
  return route.name === name
}

function navigate(name) {
  emit('close')
  if (name === 'patient-record') {
    router.push({ name: 'patient-record', params: { id: 'DEM-2026-001' } })
  } else {
    router.push({ name })
  }
}
</script>

<template>
  <!-- Backdrop mobile injecté dans le body pour éviter tout conflit de z-index -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="sidebar-mobile-backdrop"
        @click="emit('close')"
      />
    </Transition>
  </Teleport>

  <!-- Sidebar principale fidèle à la capture NurseFlow -->
  <aside :class="['v-sidebar', isOpen ? 'v-sidebar--mobile-open' : '']">
    <!-- Brand / Logo NurseFlow -->
    <div class="vsb-brand" @click="navigate('dashboard')" style="cursor:pointer">
      <AppLogo :size="38" />
      <div class="vsb-brand-text">
        <span>NurseFlow</span>
        <small>Dossier de soins infirmier</small>
      </div>
      <!-- Bouton fermer sur mobile -->
      <button
        type="button"
        class="vsb-mobile-close"
        aria-label="Fermer le menu"
        @click.stop="emit('close')"
      >
        <AppIcon name="x" :size="20" />
      </button>
    </div>

    <!-- Navigation principale (7 rubriques exactes de la capture) -->
    <nav class="vsb-nav">
      <button
        v-for="item in navItems"
        :key="item.name"
        :class="['vsb-item', isActive(item.name) ? 'vsb-item--active' : '']"
        @click="navigate(item.name)"
      >
        <span class="vsb-icon">
          <AppIcon :name="item.icon" :size="19" />
        </span>
        <span class="vsb-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Spacer pour pousser la citation en bas -->
    <div style="flex:1" />

    <!-- Citation et bouclier de protection (exactement comme dans la capture) -->
    <div class="vsb-quote-container">
      <p class="vsb-quote-text">
        « Prendre soin,<br>
        c'est aussi écouter. »
      </p>
      <div class="vsb-quote-shield">
        <AppIcon name="shield" :size="16" />
      </div>
    </div>
  </aside>
</template>
