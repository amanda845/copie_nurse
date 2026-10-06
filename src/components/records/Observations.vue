<script setup>
import { ref, computed } from 'vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const showAll = ref(false)
const searchQuery = ref('')

const observationsList = ref([
  {
    id: 1,
    time: '19:10',
    date: "Aujourd'hui",
    nurse: 'Infirmière Sarah',
    badge: 'Surveillance',
    badgeClass: 'badge-surv',
    text: 'État stable, surveillance poursuivie. Patient calme, douleur évaluée à 2/10.'
  },
  {
    id: 2,
    time: '17:30',
    date: "Aujourd'hui",
    nurse: 'Infirmière Amel',
    badge: 'Constantes',
    badgeClass: 'badge-const',
    text: 'Patient conscient et coopérant. Constantes dans les limites habituelles (TA: 125/78 mmHg, FC: 74 bpm, SaO2: 98%).'
  },
  {
    id: 3,
    time: '14:45',
    date: "Aujourd'hui",
    nurse: 'Infirmière Nadia',
    badge: 'Admission',
    badgeClass: 'badge-adm',
    text: "Admission dans le service, installation en chambre effectuée. Bracelet d'identification vérifié, appel malade fonctionnel."
  },
  {
    id: 4,
    time: '11:20',
    date: "Aujourd'hui",
    nurse: 'Infirmière Sarah',
    badge: 'Pansement',
    badgeClass: 'badge-pansement',
    text: "Réfection du pansement abdominal. Cicatrice propre et nette, absence d'écoulement ou de signe inflammatoire. Apyrexie."
  },
  {
    id: 5,
    time: '08:15',
    date: "Aujourd'hui",
    nurse: 'Infirmière Salima',
    badge: 'Traitement',
    badgeClass: 'badge-traitement',
    text: 'Distribution et administration des traitements du matin sous surveillance directe. Bonne tolérance digestive. Diurèse conservée.'
  },
  {
    id: 6,
    time: '23:45',
    date: 'Hier',
    nurse: 'Infirmier Karim',
    badge: 'Nuit',
    badgeClass: 'badge-nuit',
    text: 'Tour de garde de nuit. Patient endormi calmement, respiration régulière et calme. Aucune plainte nocturne.'
  },
  {
    id: 7,
    time: '18:00',
    date: 'Hier',
    nurse: 'Infirmière Amel',
    badge: 'Glycémie',
    badgeClass: 'badge-const',
    text: 'Contrôle glycémie capillaire : 1.18 g/L. Visite médicale effectuée avec le Dr. Meziane, consignes de surveillance maintenues.'
  },
  {
    id: 8,
    time: '13:30',
    date: 'Hier',
    nurse: 'Infirmière Nadia',
    badge: 'Perfusion',
    badgeClass: 'badge-traitement',
    text: 'Pose de perfusion NaCl 0.9% 500ml à débit 40 ml/h sur VVP bras gauche. Voie perméable, indolore, pansement sec.'
  },
  {
    id: 9,
    time: '09:00',
    date: '18 févr.',
    nurse: 'Infirmière Sarah',
    badge: 'Entrée',
    badgeClass: 'badge-adm',
    text: "Recueil des données cliniques initiales et ouverture du dossier de soins. Allergie connue à la Pénicilline étiquetée."
  }
])

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return observationsList.value
  const q = searchQuery.value.toLowerCase()
  return observationsList.value.filter(
    (obs) =>
      obs.nurse.toLowerCase().includes(q) ||
      obs.text.toLowerCase().includes(q) ||
      obs.badge.toLowerCase().includes(q) ||
      obs.time.includes(q) ||
      obs.date.toLowerCase().includes(q)
  )
})

const displayedObservations = computed(() => {
  if (showAll.value) {
    return filteredList.value
  }
  return filteredList.value.slice(0, 3)
})

function toggleShowAll() {
  showAll.value = !showAll.value
  if (!showAll.value) {
    searchQuery.value = ''
  }
}
</script>

<template>
  <section class="panel observations">
    <div class="panel-header">
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <h2>Observations</h2>
          <span class="obs-count-badge">{{ observationsList.length }} notes</span>
          <span v-if="showAll" class="obs-expanded-indicator">Historique complet</span>
        </div>
        <p>{{ showAll ? 'Historique complet des transmissions et suivis infirmiers' : 'Suivi clinique de la journée (3 dernières notes)' }}</p>
      </div>
      <AppButton
        variant="ghost"
        @click="toggleShowAll"
        :title="showAll ? 'Réduire la liste des observations' : 'Afficher toutes les observations du dossier'"
      >
        <span style="display:inline-flex; align-items:center; gap:5px;">
          <AppIcon :name="showAll ? 'chevron' : 'eye'" :size="15" :style="showAll ? 'transform: rotate(-90deg)' : ''" />
          {{ showAll ? 'Réduire' : `Voir tout (${observationsList.length})` }}
        </span>
      </AppButton>
    </div>

    <!-- Barre de recherche rapide quand la liste est dépliée -->
    <div v-if="showAll" class="obs-search-bar">
      <AppIcon name="search" :size="16" class="obs-search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher dans toutes les observations (mot-clé, soignant, type de soin)…"
        class="obs-search-input"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="obs-search-clear"
        @click="searchQuery = ''"
      >
        <AppIcon name="x" :size="14" />
      </button>
    </div>

    <div class="observation-list" :class="{ 'is-expanded': showAll }">
      <div
        v-for="obs in displayedObservations"
        :key="obs.id"
        class="obs-item"
      >
        <time>{{ obs.time }}</time>
        <span />
        <article>
          <header>
            <div style="display:flex; align-items:center; gap:7px;">
              <strong>{{ obs.nurse }}</strong>
              <span class="obs-tag" :class="obs.badgeClass">{{ obs.badge }}</span>
            </div>
            <small>{{ obs.date }}</small>
          </header>
          <p>{{ obs.text }}</p>
        </article>
      </div>

      <div v-if="displayedObservations.length === 0" class="obs-empty">
        <p>Aucune observation ne correspond à votre recherche « {{ searchQuery }} ».</p>
      </div>
    </div>

    <!-- Pied de carte avec rappel quand déplié -->
    <div v-if="showAll && displayedObservations.length > 0" class="obs-footer-info">
      <span>Affichage de {{ displayedObservations.length }} observation(s) sur {{ observationsList.length }}</span>
      <button type="button" class="obs-collapse-link" @click="toggleShowAll">
        ↑ Revenir aux dernières observations
      </button>
    </div>
  </section>
</template>

<style scoped>
.obs-count-badge {
  font-size: 10px;
  font-weight: 700;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 2px 7px;
  border-radius: 12px;
}

.obs-expanded-indicator {
  font-size: 10px;
  font-weight: 600;
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  padding: 2px 7px;
  border-radius: 12px;
}

.obs-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 19px 4px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.obs-search-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.obs-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 11px;
  color: #1e293b;
  width: 100%;
}

.obs-search-clear {
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}

.obs-search-clear:hover {
  color: #1e293b;
}

.obs-tag {
  font-size: 8.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
}

.badge-surv {
  background: #eff6ff;
  color: #2563eb;
}

.badge-const {
  background: #f0fdf4;
  color: #16a34a;
}

.badge-adm {
  background: #fdf2f8;
  color: #be185d;
}

.badge-pansement {
  background: #faf5ff;
  color: #7e22ce;
}

.badge-traitement {
  background: #fff7ed;
  color: #c2410c;
}

.badge-nuit {
  background: #f1f5f9;
  color: #475569;
}

.obs-empty {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 11px;
}

.obs-footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 19px 12px;
  font-size: 10px;
  color: #64748b;
  border-top: 1px dashed #e2e8f0;
  margin-top: 6px;
}

.obs-collapse-link {
  background: none;
  border: none;
  color: var(--primary, #0284c7);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.obs-collapse-link:hover {
  text-decoration: underline;
}

.observation-list.is-expanded {
  max-height: 480px;
  overflow-y: auto;
  scrollbar-width: thin;
  padding-right: 14px;
}
</style>
