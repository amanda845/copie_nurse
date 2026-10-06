<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { patients } from '@/modules/patients/patients.data'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppAvatar from '@/components/common/AppAvatar.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PatientTable from '@/components/patients/PatientTable.vue'

const router = useRouter()

// Onglets principaux
const mainTab    = ref('hospitalise') // 'hospitalise' | 'jour'
const genderTab  = ref('tous')        // 'tous' | 'M' | 'F'
const filter     = ref('Tous')
const query      = ref('')

const statusFilters = ['Tous', 'Stable', 'À surveiller', 'Urgent', 'Sortie']

// Listes de base selon l'onglet principal
const hospitalisedPatients = computed(() => patients.filter(p => p.type === 'hospitalise'))
const jourPatients         = computed(() => patients.filter(p => p.type === 'jour'))

// Compteurs genre dans hospitalisés
const maleCount   = computed(() => hospitalisedPatients.value.filter(p => p.gender === 'M').length)
const femaleCount = computed(() => hospitalisedPatients.value.filter(p => p.gender === 'F').length)

// Filtrage complet pour hospitalisés
const visibleHospitalise = computed(() => {
  return hospitalisedPatients.value.filter((p) => {
    const matchStatus = filter.value === 'Tous' || p.status === filter.value
    const matchGender = genderTab.value === 'tous' || p.gender === genderTab.value
    const matchQuery  = p.name.toLowerCase().includes(query.value.toLowerCase())
      || p.room.includes(query.value)
      || p.id.toLowerCase().includes(query.value.toLowerCase())
    return matchStatus && matchGender && matchQuery
  })
})

// Filtrage pour hôpital du jour
const visibleJour = computed(() => {
  return jourPatients.value.filter((p) => {
    const matchStatus = filter.value === 'Tous' || p.status === filter.value
    const matchQuery  = p.name.toLowerCase().includes(query.value.toLowerCase())
      || p.id.toLowerCase().includes(query.value.toLowerCase())
    return matchStatus && matchQuery
  })
})

// Par genre dans hospitalisés
const maleVisible   = computed(() => visibleHospitalise.value.filter(p => p.gender === 'M'))
const femaleVisible = computed(() => visibleHospitalise.value.filter(p => p.gender === 'F'))
</script>

<template>
  <div>
    <!-- En-tête -->
    <section class="panel patients-page-header">
      <div class="panel-header">
        <div>
          <h2>Patients du service</h2>
          <p>Hospitalisés et hôpital du jour — Vue en temps réel</p>
        </div>
        <AppButton icon="plus" @click="router.push({ name: 'patients-add' })">
          Ajouter un patient
        </AppButton>
      </div>
    </section>

    <!-- ── Onglets principaux : Hospitalisés / Hôpital du jour ── -->
    <section style="margin-bottom:16px">
      <div class="main-type-tabs">
        <button
          :class="['mtt-btn', mainTab === 'hospitalise' ? 'mtt-active' : '']"
          @click="mainTab = 'hospitalise'; genderTab = 'tous'"
        >
          <AppIcon name="bed" :size="17" />
          Patients hospitalisés
          <span class="mtt-count">{{ hospitalisedPatients.length }}</span>
        </button>
        <button
          :class="['mtt-btn', mainTab === 'jour' ? 'mtt-active mtt-active--jour' : '']"
          @click="mainTab = 'jour'; genderTab = 'tous'"
        >
          <AppIcon name="calendar" :size="17" />
          Hôpital du jour
          <span class="mtt-count mtt-count--jour">{{ jourPatients.length }}</span>
        </button>
      </div>
    </section>

    <!-- ── Sous-onglets genre (seulement pour hospitalisés) ── -->
    <section v-if="mainTab === 'hospitalise'" class="gender-tabs-section">
      <div class="gender-tabs">
        <button
          :class="['gender-tab', genderTab === 'tous' ? 'active' : '']"
          @click="genderTab = 'tous'"
        >
          <span class="gender-tab-icon all-icon">⚕</span>
          Tous
          <span class="gender-count neutral">{{ hospitalisedPatients.length }}</span>
        </button>
        <button
          :class="['gender-tab', genderTab === 'M' ? 'active male' : '']"
          @click="genderTab = 'M'"
        >
          <span class="gender-tab-icon male-icon">♂</span>
          Hommes
          <span class="gender-count male-count">{{ maleCount }}</span>
        </button>
        <button
          :class="['gender-tab', genderTab === 'F' ? 'active female' : '']"
          @click="genderTab = 'F'"
        >
          <span class="gender-tab-icon female-icon">♀</span>
          Femmes
          <span class="gender-count female-count">{{ femaleCount }}</span>
        </button>
      </div>
    </section>

    <!-- Filtres statut + recherche -->
    <section class="patients-filter-panel">
      <div class="patients-filter-row">
        <label class="search-field">
          <AppIcon name="search" :size="18" />
          <input v-model="query" placeholder="Rechercher un patient..." />
        </label>
        <div class="filter-tabs">
          <button
            v-for="item in statusFilters"
            :key="item"
            :class="['filter-chip', `filter-chip-${item.toLowerCase().replace('à surveiller','surveillance')}`, filter === item ? 'active' : '']"
            @click="filter = item"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         VUE HOSPITALISÉS
    ══════════════════════════════════════════ -->
    <template v-if="mainTab === 'hospitalise'">

      <!-- Tous -->
      <template v-if="genderTab === 'tous'">
        <section class="patients-table-panel">
          <div v-if="visibleHospitalise.length" class="patient-management-table">
            <PatientTable :rows="visibleHospitalise" />
          </div>
          <EmptyState v-else />
        </section>
      </template>

      <!-- Hommes -->
      <template v-else-if="genderTab === 'M'">
        <section class="patients-table-panel">
          <div class="gender-section-header male-header">
            <span class="gender-section-icon">♂</span>
            <div>
              <strong>Section Hommes</strong>
              <small>{{ maleVisible.length }} patient(s) hospitalisé(s)</small>
            </div>
          </div>
          <div v-if="maleVisible.length" class="patient-management-table">
            <PatientTable :rows="maleVisible" />
          </div>
          <EmptyState v-else />
        </section>
      </template>

      <!-- Femmes -->
      <template v-else-if="genderTab === 'F'">
        <section class="patients-table-panel">
          <div class="gender-section-header female-header">
            <span class="gender-section-icon">♀</span>
            <div>
              <strong>Section Femmes</strong>
              <small>{{ femaleVisible.length }} patiente(s) hospitalisée(s)</small>
            </div>
          </div>
          <div v-if="femaleVisible.length" class="patient-management-table">
            <PatientTable :rows="femaleVisible" />
          </div>
          <EmptyState v-else />
        </section>
      </template>

    </template>

    <!-- ══════════════════════════════════════════
         VUE HÔPITAL DU JOUR
    ══════════════════════════════════════════ -->
    <template v-else-if="mainTab === 'jour'">
      <section class="patients-table-panel">
        <!-- Explication -->
        <div class="hdj-info-banner">
          <AppIcon name="calendar" :size="20" style="color:#7c3aed;flex-shrink:0" />
          <div>
            <strong>Hôpital du Jour — Soins ambulatoires</strong>
            <p>Ces patients viennent chaque jour pour leurs soins (chimiothérapie, transfusion, perfusion…) et retournent à domicile après leur séance. Ils ne sont pas hébergés à l'hôpital.</p>
          </div>
        </div>

        <!-- Cartes HDJ -->
        <div v-if="visibleJour.length" class="hdj-cards">
          <div
            v-for="p in visibleJour"
            :key="p.id"
            class="hdj-patient-card"
            @click="router.push({ name: 'patient-record', params: { id: p.id } })"
          >
            <div class="hdj-card-top">
              <AppAvatar :initials="p.initials" :tone="p.tone" />
              <div class="hdj-card-info">
                <strong>{{ p.name }}</strong>
                <small>{{ p.age }} ans · {{ p.gender === 'M' ? '♂ Homme' : '♀ Femme' }}</small>
              </div>
              <AppBadge :status="p.status" />
            </div>
            <div class="hdj-card-motif">
              <AppIcon name="stethoscope" :size="13" />
              {{ p.motif || 'Consultation journalière' }}
            </div>
            <div class="hdj-card-footer">
              <span class="hdj-room">Poste {{ p.room }}</span>
              <span class="hdj-time">
                <AppIcon name="clock" :size="12" /> {{ p.updated }}
              </span>
              <button class="hdj-voir-btn">Voir <AppIcon name="arrow" :size="13" /></button>
            </div>
          </div>
        </div>
        <EmptyState v-else />
      </section>
    </template>
  </div>
</template>
