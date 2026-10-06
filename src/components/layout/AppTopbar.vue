<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import NurseSwitcherModal from './NurseSwitcherModal.vue'
import { useNurses } from '@/composables/useNurses'

defineEmits(['toggle-menu'])

const { activeNurse } = useNurses()
const showSwitcher = ref(false)
const showNotifications = ref(false)

// Notifications data
const notifications = ref([
  { id: 1, title: 'Surveillance constantes', text: 'Chambre H02 · Lit 1 (Yacine Aït) - Douleur thoracique', time: '10:15', unread: true },
  { id: 2, title: 'Réservation HDJ', text: 'HDJ-04 réservé pour Perfusion à 13h30', time: '09:40', unread: true },
  { id: 3, title: 'Transfert programmé', text: 'Chambre F03 · Lit 3 - Arrivée réanimation à 11h30', time: '08:50', unread: true },
])

// Clock & Date state
const formattedDate = ref('')
const formattedTime = ref('')

function updateClock() {
  // Soustraction de 1 heure (-1h) comme demandé par l'utilisateur
  const now = new Date(Date.now() - 3600000)
  
  // Format day date: e.g. "Dimanche 4 octobre 2026"
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const dateStr = now.toLocaleDateString('fr-FR', options)
  formattedDate.value = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
  
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  formattedTime.value = `${h}:${m}`
}

let timer = null
onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <header class="topbar-carenurse">
    <!-- Groupe Gauche : Hamburger (mobile) + Etablissement -->
    <div class="tbc-left-group">
      <button
        type="button"
        class="tbc-burger-btn"
        aria-label="Ouvrir le menu de navigation"
        title="Menu"
        @click="$emit('toggle-menu')"
      >
        <AppIcon name="menu" :size="22" />
      </button>

      <!-- Etablissement / Service hospitalier -->
      <div class="tbc-hospital">
        <div class="tbc-hospital-icon">
          <AppIcon name="hospital" :size="22" />
        </div>
        <div class="tbc-hospital-text">
          <h2 class="tbc-hospital-name">
            <span class="tbc-name-full">Centre Hospitalier Universitaire - Béjaïa</span>
            <span class="tbc-name-short">CHU Béjaïa</span>
          </h2>
          <span class="tbc-service-name">Service des soins infirmiers</span>
        </div>
      </div>
    </div>

    <!-- Informations soignant, alertes et heure (Droite) -->
    <div class="tbc-right">
      <!-- Cloche de notification -->
      <div class="tbc-notif-wrapper">
        <button
          type="button"
          class="tbc-notif-btn"
          aria-label="Notifications"
          @click="showNotifications = !showNotifications"
        >
          <AppIcon name="bell" :size="19" />
          <span class="tbc-notif-badge">3</span>
        </button>

        <!-- Dropdown notifications -->
        <div v-if="showNotifications" class="tbc-notif-popover">
          <div class="tbc-notif-header">
            <strong>Notifications récentes</strong>
            <span class="tbc-notif-count">3 nouvelles</span>
          </div>
          <div class="tbc-notif-list">
            <div v-for="n in notifications" :key="n.id" class="tbc-notif-item">
              <div class="tbc-notif-dot" />
              <div class="tbc-notif-body">
                <strong>{{ n.title }}</strong>
                <p>{{ n.text }}</p>
                <small>{{ n.time }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profil infirmier actif -->
      <button
        type="button"
        class="tbc-nurse-profile"
        title="Changer d'infirmier ou gérer l'équipe"
        @click="showSwitcher = true"
      >
        <div class="tbc-avatar">
          <span v-if="activeNurse && activeNurse.initials" class="tbc-avatar-initials">{{ activeNurse.initials }}</span>
          <AppIcon v-else name="user" :size="20" />
        </div>
        <div class="tbc-nurse-details">
          <strong class="tbc-role-title">{{ activeNurse?.name || 'Infirmier(ère)' }}</strong>
          <span class="tbc-nurse-dept">{{ activeNurse?.role || 'Infirmière DE' }} · {{ activeNurse?.service || 'Médecine interne' }}</span>
        </div>
      </button>

      <!-- Séparateur vertical -->
      <div class="tbc-divider" />

      <!-- Date et heure en direct (-1h) -->
      <div class="tbc-datetime">
        <span class="tbc-date">{{ formattedDate || 'Dimanche 4 octobre 2026' }}</span>
        <span class="tbc-time">{{ formattedTime || '23:19' }}</span>
      </div>
    </div>

    <!-- Modale soignants pour prise de poste -->
    <NurseSwitcherModal
      v-if="showSwitcher"
      @close="showSwitcher = false"
    />
  </header>
</template>
