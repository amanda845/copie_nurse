<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useToast } from '@/composables/useToast'
import { useNurses } from '@/composables/useNurses'
import { clearSession } from '@/services/api'

const router = useRouter()
const { toastMessage, notify, dismiss } = useToast()
const modal = ref(null) // null | 'observation' | 'transmission'
const isSidebarOpen = ref(false)

function openModal(type) {
  modal.value = type
}

function closeModal() {
  modal.value = null
}

const { logActivity } = useNurses()

function onModalSubmit(type) {
  notify(
    type === 'observation'
      ? 'Observation ajoutée au dossier'
      : "Transmission partagée avec l'équipe",
  )
  logActivity({
    type: type === 'observation' ? 'observation' : 'transmission',
    action: type === 'observation' ? 'Observation clinique enregistrée' : "Transmission d'équipe partagée",
    target: type === 'observation' ? 'Surveillance et constantes patient' : 'Relève de soins partagée',
  })
}

function handleLogout() {
  clearSession()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-shell-v2">
    <!-- Sidebar gauche avec support mobile -->
    <AppSidebar
      :is-open="isSidebarOpen"
      @close="isSidebarOpen = false"
    />

    <!-- Zone principale -->
    <div class="main-area">
      <!-- Topbar supérieure avec bouton hamburger sur mobile -->
      <AppTopbar @toggle-menu="isSidebarOpen = !isSidebarOpen" />

      <!-- Contenu de page -->
      <main class="page-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component
              :is="Component"
              :key="$route.fullPath"
              @open-modal="openModal"
              @notify="notify"
              @logout="handleLogout"
            />
          </Transition>
        </RouterView>
      </main>

      <!-- Footer signature : Réalisé par ZAIDI Amanda -->
      <AppFooter />
    </div>

    <!-- Modales globales -->
    <AppModal
      v-if="modal"
      :type="modal"
      @close="closeModal"
      @submit="onModalSubmit"
    />

    <!-- Toast notification -->
    <div v-if="toastMessage" class="toast">
      <span>
        <AppIcon name="check" />
      </span>
      <div>
        <strong>Opération réussie</strong>
        <small>{{ toastMessage }}</small>
      </div>
      <button @click="dismiss">
        <AppIcon name="x" :size="16" />
      </button>
    </div>
  </div>
</template>
