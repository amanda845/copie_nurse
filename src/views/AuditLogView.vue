<script setup>
import { computed, onMounted, ref } from 'vue'
import PageTitle from '@/components/common/PageTitle.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { apiListActivity } from '@/services/api'

const activities = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const filterType = ref('all')

const typeOptions = [
  ['all', 'Toutes'],
  ['patient', 'Patients'],
  ['treatment', 'Traitements'],
  ['diagnostic', 'Diagnostics'],
  ['staff', 'Équipe'],
  ['session', 'Sessions'],
  ['feedback', 'Feedbacks'],
  ['observation', 'Observations'],
  ['transmission', 'Transmissions'],
]

function formatDate(timestamp) {
  return timestamp
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
    : 'Date indisponible'
}

function iconFor(type) {
  return type === 'treatment' ? 'pill' : type === 'diagnostic' ? 'stethoscope' : type === 'staff' ? 'users' : type === 'session' ? 'shield' : type === 'patient' ? 'user' : 'file'
}

const visibleActivities = computed(() => {
  const query = search.value.trim().toLowerCase()
  return activities.value.filter((activity) => {
    const matchesType = filterType.value === 'all' || activity.type === filterType.value
    const haystack = `${activity.nurseName || ''} ${activity.action || ''} ${activity.target || ''}`.toLowerCase()
    return matchesType && (!query || haystack.includes(query))
  })
})

async function loadActivity() {
  loading.value = true
  error.value = ''
  try {
    const response = await apiListActivity('?limit=500')
    activities.value = response.activities || []
  } catch (err) {
    error.value = err.message || 'Impossible de charger le journal serveur.'
  } finally {
    loading.value = false
  }
}

onMounted(loadActivity)
</script>

<template>
  <div>
    <PageTitle title="Journal d’audit serveur" subtitle="Historique horodaté des modifications réalisées par toute l’équipe infirmière.">
      <template #action>
        <button class="btn btn-secondary" type="button" @click="loadActivity">{{ loading ? 'Actualisation…' : 'Actualiser le journal' }}</button>
      </template>
    </PageTitle>

    <section class="panel">
      <div class="toolbar" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <input v-model="search" class="obs-search-input" style="border:1px solid var(--line);padding:10px 12px;border-radius:8px;min-width:260px" placeholder="Rechercher un infirmier ou une modification…" />
        <div class="filter-pills">
          <button v-for="option in typeOptions" :key="option[0]" type="button" :class="['filter-pill', filterType === option[0] ? 'active' : '']" @click="filterType = option[0]">{{ option[1] }}</button>
        </div>
      </div>

      <div v-if="error" class="field-error" style="margin:16px">{{ error }}</div>
      <div v-if="!loading && !error && visibleActivities.length === 0" class="empty-state" style="padding:40px">
        <AppIcon name="clock" :size="30" />
        <h3>Aucune modification trouvée</h3>
        <p>Les actions seront affichées ici dès qu’un infirmier modifiera un dossier.</p>
      </div>

      <div v-else class="activity-timeline-list">
        <div v-for="activity in visibleActivities" :key="activity.id" class="activity-log-row">
          <div class="act-icon-box" :class="activity.type"><AppIcon :name="iconFor(activity.type)" :size="15" /></div>
          <div class="act-content">
            <div class="act-top"><strong>{{ activity.action }}</strong><span class="act-time">{{ formatDate(activity.timestamp) }}</span></div>
            <div class="act-target">{{ activity.target || activity.entity }}</div>
            <small class="act-patient">Infirmier : <b>{{ activity.nurseName || 'Compte système' }}</b> · Objet : <b>{{ activity.entity }} #{{ activity.entityId || '—' }}</b></small>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
