<script setup>
import { ref, computed, onMounted } from 'vue'
import PageTitle from '@/components/common/PageTitle.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppAvatar from '@/components/common/AppAvatar.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import InfoRow from '@/components/records/InfoRow.vue'
import NurseSwitcherModal from '@/components/layout/NurseSwitcherModal.vue'
import { useNurses } from '@/composables/useNurses'
import { apiListActivity } from '@/services/api'

const emit = defineEmits(['notify', 'logout'])

const { activeNurse, activityLog } = useNurses()
const showSwitcher = ref(false)
const filterType = ref('all')
const loadingActivity = ref(false)
const sourceLabel = ref('Journal serveur')

function formatActivityDate(activity) {
  if (!activity.timestamp) return `${activity.date || ''} à ${activity.time || ''}`
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(activity.timestamp))
}

async function refreshServerActivity() {
  loadingActivity.value = true
  try {
    const response = await apiListActivity('?limit=500')
    activityLog.value = response.activities || []
    sourceLabel.value = 'Journal serveur synchronisé'
  } catch {
    sourceLabel.value = 'Mode hors connexion — journal local'
  } finally {
    loadingActivity.value = false
  }
}

onMounted(refreshServerActivity)

const nurseActivities = computed(() => {
  return activityLog.value.filter(a => {
    const isThisNurse = a.nurseId === activeNurse.value.id || a.nurseName === activeNurse.value.name
    if (!isThisNurse) return false
    if (filterType.value === 'all') return true
    return a.type === filterType.value
  })
})

const treatmentsCount = computed(() => {
  return activityLog.value.filter(a => (a.nurseId === activeNurse.value.id || a.nurseName === activeNurse.value.name) && a.type === 'treatment').length
})

const observationsCount = computed(() => {
  return activityLog.value.filter(a => (a.nurseId === activeNurse.value.id || a.nurseName === activeNurse.value.name) && ['observation', 'diagnostic', 'patient'].includes(a.type)).length
})

function logout() {
  emit('logout')
}
</script>

<template>
  <div>
    <PageTitle
      title="Profil Soignant & Traçabilité"
      subtitle="Fiche du soignant actif et historique de ses actes réalisés en service."
    >
      <template #action>
        <AppButton icon="users" variant="secondary" @click="showSwitcher = true">
          Changer de soignant
        </AppButton>
      </template>
    </PageTitle>

    <div class="settings-layout">
      <!-- Fiche du soignant en service -->
      <section class="panel profile-card">
        <div class="profile-cover" />
        <div class="profile-details">
          <AppAvatar :initials="activeNurse.initials" :tone="activeNurse.tone" large />
          <h2>{{ activeNurse.name }}</h2>
          <p>{{ activeNurse.role }}</p>

          <div class="profile-info">
            <InfoRow label="Statut" value="En service actif" :emphasis="true" />
            <InfoRow label="Service d'affectation" :value="activeNurse.service" />
            <InfoRow label="Matricule / Badge" :value="activeNurse.badge" />
            <InfoRow label="Horodatage des actes" value="Automatique et signé" />
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
            <AppButton class="full-button" variant="secondary" icon="users" @click="showSwitcher = true">
              Changer de soignant en service
            </AppButton>
            <AppButton class="full-button" variant="danger" icon="logout" @click="logout">
              Terminer le service
            </AppButton>
          </div>
        </div>
      </section>

      <!-- Historique des actions et soins de ce soignant -->
      <div style="display:flex;flex-direction:column;gap:18px">
        <!-- Statistiques de garde -->
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Bilan du travail de garde</h2>
              <p>Actes enregistrés par {{ activeNurse.name }}</p>
            </div>
            <span class="badge-status-on">● Session en cours</span>
          </div>

          <div class="stats-grid" style="padding: 16px; grid-template-columns: 1fr 1fr; margin: 0">
            <div class="stat-card" style="box-shadow: none; border-color: var(--line)">
              <div class="stat-icon tone-blue"><AppIcon name="pill" /></div>
              <div class="stat-copy">
                <span>Traitements validés</span>
                <strong>{{ treatmentsCount }}</strong>
                <small>Par {{ activeNurse.shortName || activeNurse.name }}</small>
              </div>
            </div>
            <div class="stat-card" style="box-shadow: none; border-color: var(--line)">
              <div class="stat-icon tone-green"><AppIcon name="file" /></div>
              <div class="stat-copy">
                <span>Observations & Soins</span>
                <strong>{{ observationsCount }}</strong>
                <small>Ce poste</small>
              </div>
            </div>
          </div>
        </section>

        <!-- Journal détaillé de ce qu'il a fait -->
        <section class="panel">
          <div class="panel-header" style="flex-wrap:wrap;gap:10px">
            <div>
              <h2>Journal des soins et consultations</h2>
              <p>{{ sourceLabel }} · toutes les modifications et actes effectués</p>
            </div>
            <div class="filter-pills" style="display:flex;flex-wrap:wrap;gap:6px">
              <button type="button" class="filter-pill" @click="refreshServerActivity">
                {{ loadingActivity ? 'Synchronisation…' : 'Actualiser' }}
              </button>
              <button
                type="button"
                :class="['filter-pill', filterType === 'all' ? 'active' : '']"
                @click="filterType = 'all'"
              >
                Tous ({{ nurseActivities.length }})
              </button>
              <button
                type="button"
                :class="['filter-pill', filterType === 'treatment' ? 'active' : '']"
                @click="filterType = 'treatment'"
              >
                Traitements
              </button>
              <button
                type="button"
                :class="['filter-pill', filterType === 'observation' ? 'active' : '']"
                @click="filterType = 'observation'"
              >
                Observations
              </button>
              <button
                v-for="type in ['diagnostic', 'patient', 'staff', 'session', 'feedback']"
                :key="type"
                type="button"
                :class="['filter-pill', filterType === type ? 'active' : '']"
                @click="filterType = type"
              >
                {{ type === 'diagnostic' ? 'Diagnostics' : type === 'patient' ? 'Patients' : type === 'staff' ? 'Équipe' : type === 'session' ? 'Sessions' : 'Feedbacks' }}
              </button>
            </div>
          </div>

          <!-- Liste des activités -->
          <div class="activity-timeline-list">
            <div v-if="nurseActivities.length === 0" class="empty-state" style="padding: 30px">
              <AppIcon name="clock" :size="32" />
              <h3>Aucune action enregistrée pour ce soignant</h3>
              <p>
                Dès que vous administrez un traitement ou ajoutez une observation,
                l'acte sera automatiquement signé sous le nom de {{ activeNurse.name }}.
              </p>
            </div>

            <div
              v-for="act in nurseActivities"
              :key="act.id"
              class="activity-log-row"
            >
              <div class="act-icon-box" :class="act.type">
                <AppIcon :name="act.type === 'treatment' ? 'pill' : act.type === 'diagnostic' ? 'stethoscope' : act.type === 'staff' ? 'users' : act.type === 'session' ? 'shield' : 'file'" :size="15" />
              </div>
              <div class="act-content">
                <div class="act-top">
                  <strong>{{ act.action }}</strong>
                  <span class="act-time">{{ formatActivityDate(act) }}</span>
                </div>
                <div class="act-target">{{ act.target }}</div>
                <small class="act-patient">
                  Patient : <b>{{ act.patient }}</b> · Signé par <b>{{ act.nurseName }}</b>
                </small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modale de changement rapide de soignant -->
    <NurseSwitcherModal
      v-if="showSwitcher"
      @close="showSwitcher = false"
    />
  </div>
</template>
