<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import {
  roomsState,
  roomsStats,
  setBedStatus,
  setHdjSessionStatus
} from '@/modules/rooms/rooms.data'

const router = useRouter()

// ── Services existants de l'hôpital (Page d'accueil uniquement) ──
const activeServiceFilter = ref(null)

const hospitalServices = ref([
  {
    id: 'medecine',
    name: 'Médecine Interne',
    pole: 'Hospitalisation Complète',
    badge: '16 lits',
    badgeClass: 'badge-serv-conventionnel',
    icon: 'stethoscope',
    iconClass: 'iconbox-med',
    description: 'Soins médicaux continus, bilans étiologiques, diabétologie et pathologies chroniques.',
    status: 'Actif 24/7',
    targetAnchor: 'col-conventional'
  },
  {
    id: 'chirurgie',
    name: 'Chirurgie Générale & Viscérale',
    pole: 'Bloc & Hospitalisation',
    badge: '16 lits',
    badgeClass: 'badge-serv-chirurgie',
    icon: 'cross',
    iconClass: 'iconbox-chir',
    description: 'Interventions programmées et prise en charge post-opératoire des patients hospitalisés.',
    status: 'Actif 24/7',
    targetAnchor: 'col-conventional'
  },
  {
    id: 'hdj',
    name: 'Hôpital de Jour (HDJ)',
    pole: 'Soins Ambulatoires',
    badge: 'Sans nuitée',
    badgeClass: 'badge-serv-hdj',
    icon: 'clock',
    iconClass: 'iconbox-hdj',
    description: 'Rendez-vous programmés sans hébergement : chimiothérapie, transfusions et perfusions.',
    status: '08h00 – 18h00',
    targetAnchor: 'col-hdj'
  },
  {
    id: 'urgences',
    name: 'Urgences & SAU',
    pole: 'Soins Critiques',
    badge: 'Garde 24h/24',
    badgeClass: 'badge-serv-urgence',
    icon: 'alert',
    iconClass: 'iconbox-urg',
    description: 'Accueil continu et tri médical des urgences vitales avec salle de déchoquage.',
    status: 'Garde 24/7',
    targetAnchor: null
  },
  {
    id: 'cardiologie',
    name: 'Cardiologie & USIC',
    pole: 'Soins Intensifs Cardio',
    badge: 'Télémétrie',
    badgeClass: 'badge-serv-cardio',
    icon: 'heart-pulse',
    iconClass: 'iconbox-cardio',
    description: 'Surveillance cardiaque continue, bilans coronariens et explorations hémodynamiques.',
    status: 'Actif 24/7',
    targetAnchor: null
  },
  {
    id: 'pediatrie',
    name: 'Pédiatrie & Néonatalogie',
    pole: 'Pôle Mère-Enfant',
    badge: 'Spécialisé',
    badgeClass: 'badge-serv-ped',
    icon: 'users',
    iconClass: 'iconbox-ped',
    description: 'Soins pédiatriques de l’enfant et du nouveau-né avec accueil des familles.',
    status: 'Actif 24/7',
    targetAnchor: null
  },
  {
    id: 'maternite',
    name: 'Maternité & Gynécologie',
    pole: 'Pôle Mère-Enfant',
    badge: 'Bloc naissances',
    badgeClass: 'badge-serv-mat',
    icon: 'female',
    iconClass: 'iconbox-mat',
    description: 'Consultations obstétricales, suivi de grossesse, accouchements et suites de couches.',
    status: 'Garde 24/7',
    targetAnchor: null
  },
  {
    id: 'oncologie',
    name: 'Oncologie Médicale',
    pole: 'Cancérologie',
    badge: 'Cures & Suivi',
    badgeClass: 'badge-serv-onco',
    icon: 'pill',
    iconClass: 'iconbox-onco',
    description: 'Consultations spécialisées, suivi des protocoles de thérapies ciblées et soins de support.',
    status: 'Consultations',
    targetAnchor: 'col-hdj'
  }
])

function selectService(service) {
  if (activeServiceFilter.value === service.id) {
    activeServiceFilter.value = null
  } else {
    activeServiceFilter.value = service.id
    if (service.targetAnchor) {
      scrollToAnchor(service.targetAnchor)
    }
  }
}

function scrollToAnchor(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ── Modale pour lit d'hospitalisation complète (Hommes / Femmes) ──
const selectedBed = ref(null)
const selectedRoom = ref(null)
const selectedCategory = ref(null)

function openBedDetails(bed, room = null, category = 'conventional') {
  selectedBed.value = bed
  selectedRoom.value = room
  selectedCategory.value = category
}

function closeBedDetails() {
  selectedBed.value = null
  selectedRoom.value = null
  selectedCategory.value = null
}

function handleStatusChange(newStatus) {
  if (!selectedBed.value) return
  setBedStatus(selectedBed.value.id, newStatus)
}

// ── Modale spécifique Hôpital de Jour (Rendez-vous ambulatoires sans nuitée) ──
const selectedHdjSession = ref(null)

function openHdjSession(session) {
  selectedHdjSession.value = session
}

function closeHdjSession() {
  selectedHdjSession.value = null
}

function handleHdjStatusChange(session, newStatus) {
  setHdjSessionStatus(session.id, newStatus)
}

function viewPatientRecord(patientId) {
  closeBedDetails()
  closeHdjSession()
  if (patientId) {
    router.push({ name: 'patient-record', params: { id: patientId } })
  } else {
    router.push({ name: 'patients' })
  }
}
</script>

<template>
  <div class="carenurse-dashboard">

    <!-- ── 1. En-tête de la page ── -->
    <div class="cnd-header">
      <div class="cnd-header-icon">
        <AppIcon name="hospital" :size="32" />
      </div>
      <div class="cnd-header-text">
        <h1 class="cnd-title">Tableau de bord des services et disponibilités</h1>
        <p class="cnd-subtitle">
          Services de l'établissement, suivi des lits d'hospitalisation avec nuitée et rendez-vous d'hôpital de jour.
        </p>
      </div>
    </div>

    <!-- ── 2. SECTION DES SERVICES HOSPITALIERS (Page d'accueil uniquement) ── -->
    <section class="cnd-services-section">
      <div class="cnd-services-head">
        <div class="cnd-services-title-area">
          <div class="cnd-services-icon-badge">
            <AppIcon name="hospital" :size="20" />
          </div>
          <div>
            <h2>Services de l'Hôpital</h2>
            <p>Liste des services et spécialités médicales disponibles dans l'établissement</p>
          </div>
        </div>
        <span class="cnd-services-count-pill">{{ hospitalServices.length }} services existants</span>
      </div>

      <div class="cnd-services-grid">
        <div
          v-for="service in hospitalServices"
          :key="service.id"
          class="cnd-service-card"
          :class="{ 'is-active-service': activeServiceFilter === service.id }"
          @click="selectService(service)"
          :title="`Cliquer pour filtrer / consulter le service ${service.name}`"
        >
          <div class="cnd-service-top">
            <div :class="['cnd-service-icon-box', service.iconClass]">
              <AppIcon :name="service.icon" :size="18" />
            </div>
            <span :class="['cnd-service-badge', service.badgeClass]">{{ service.badge }}</span>
          </div>

          <strong class="cnd-service-name">{{ service.name }}</strong>
          <p class="cnd-service-desc">{{ service.description }}</p>

          <div class="cnd-service-meta">
            <span>
              <span class="cnd-service-status-dot" />
              {{ service.status }}
            </span>
            <small style="color:#0284c7; font-weight:700;">{{ service.pole }}</small>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 3. Cartes de statistiques (KPIs du haut) ── -->
    <div class="cnd-kpi-grid">
      <!-- KPI 1 : Chambres femmes -->
      <div class="cnd-kpi-card" @click="scrollToAnchor('col-conventional')" style="cursor:pointer;" title="Consulter les chambres femmes">
        <div class="cnd-kpi-icon icon-female">
          <AppIcon name="female" :size="24" />
        </div>
        <div class="cnd-kpi-info">
          <span class="cnd-kpi-label">Chambres femmes</span>
          <div class="cnd-kpi-value">{{ roomsStats.womenRoomsCount }} ch.</div>
          <span class="cnd-kpi-subtext">Hospitalisation (F01 – F04)</span>
        </div>
      </div>

      <!-- KPI 2 : Chambres hommes -->
      <div class="cnd-kpi-card" @click="scrollToAnchor('col-conventional')" style="cursor:pointer;" title="Consulter les chambres hommes">
        <div class="cnd-kpi-icon icon-male">
          <AppIcon name="male" :size="24" />
        </div>
        <div class="cnd-kpi-info">
          <span class="cnd-kpi-label">Chambres hommes</span>
          <div class="cnd-kpi-value">{{ roomsStats.menRoomsCount }} ch.</div>
          <span class="cnd-kpi-subtext">Hospitalisation (H01 – H04)</span>
        </div>
      </div>

      <!-- KPI 3 : Hôpital de jour (Ambulatoire - Sans nuitée) -->
      <div class="cnd-kpi-card" @click="scrollToAnchor('col-hdj')" style="cursor:pointer;" title="Consulter les rendez-vous d'hôpital de jour">
        <div class="cnd-kpi-icon icon-hdj">
          <AppIcon name="clock" :size="24" />
        </div>
        <div class="cnd-kpi-info">
          <span class="cnd-kpi-label">Hôpital de jour (Ambulatoire)</span>
          <div class="cnd-kpi-value">{{ roomsStats.dayHospitalCount }} RDV</div>
          <span class="cnd-kpi-subtext">
            {{ roomsStats.dayHospitalInProgress }} en soin · {{ roomsStats.dayHospitalUpcoming }} prévus (sans nuitée)
          </span>
        </div>
      </div>

      <!-- KPI 4 : Lits d'hospitalisation complète disponibles -->
      <div class="cnd-kpi-card">
        <div class="cnd-kpi-icon icon-available">
          <AppIcon name="bed" :size="24" />
        </div>
        <div class="cnd-kpi-info">
          <span class="cnd-kpi-label">Lits complets libres</span>
          <div class="cnd-kpi-value">{{ roomsStats.freeBeds }} lits</div>
          <span class="cnd-kpi-subtext">sur 32 lits d'hospitalisation</span>
        </div>
      </div>
    </div>

    <!-- ── 4. Grille des 3 colonnes : Hospitalisation complète & Hôpital de jour ── -->
    <div class="cnd-main-grid" id="col-conventional">

      <!-- ── Colonne 1 : Côté femmes (Hospitalisation complète) ── -->
      <section class="cnd-column col-women">
        <!-- Entête de colonne -->
        <div class="cnd-col-header header-women">
          <div class="cnd-col-title">
            <span class="cnd-col-icon-female">
              <AppIcon name="female" :size="18" />
            </span>
            <span>Hospitalisation Femmes</span>
          </div>
          <span class="cnd-col-badge badge-women">4 chambres · 16 lits</span>
        </div>

        <!-- Liste des chambres femmes -->
        <div class="cnd-rooms-list">
          <div
            v-for="room in roomsState.womenRooms"
            :key="room.id"
            class="cnd-room-card"
          >
            <!-- En-tête chambre -->
            <div class="cnd-room-head head-women">
              <div class="cnd-room-title">
                <AppIcon name="bed" :size="16" class="icon-room-women" />
                <strong>{{ room.name }}</strong>
              </div>
              <span class="cnd-room-capacity">4 lits avec nuitée</span>
            </div>

            <!-- Grille des lits 2x2 -->
            <div class="cnd-beds-grid">
              <button
                v-for="bed in room.beds"
                :key="bed.id"
                type="button"
                :class="['cnd-bed-chip', `bed-status-${bed.status.toLowerCase()}`]"
                :title="`${bed.id} - ${bed.status} (Cliquer pour détails du lit)`"
                @click="openBedDetails(bed, room, 'femmes')"
              >
                <div class="cnd-bed-line">
                  <span :class="['cnd-dot', `dot-${bed.status.toLowerCase()}`]" />
                  <span class="cnd-bed-code">{{ bed.id }}</span>
                </div>
                <div class="cnd-bed-line">
                  <span :class="['cnd-status-text', `text-${bed.status.toLowerCase()}`]">
                    {{ bed.status }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Colonne 2 : Côté hommes (Hospitalisation complète) ── -->
      <section class="cnd-column col-men">
        <!-- Entête de colonne -->
        <div class="cnd-col-header header-men">
          <div class="cnd-col-title">
            <span class="cnd-col-icon-male">
              <AppIcon name="male" :size="18" />
            </span>
            <span>Hospitalisation Hommes</span>
          </div>
          <span class="cnd-col-badge badge-men">4 chambres · 16 lits</span>
        </div>

        <!-- Liste des chambres hommes -->
        <div class="cnd-rooms-list">
          <div
            v-for="room in roomsState.menRooms"
            :key="room.id"
            class="cnd-room-card"
          >
            <!-- En-tête chambre -->
            <div class="cnd-room-head head-men">
              <div class="cnd-room-title">
                <AppIcon name="bed" :size="16" class="icon-room-men" />
                <strong>{{ room.name }}</strong>
              </div>
              <span class="cnd-room-capacity">4 lits avec nuitée</span>
            </div>

            <!-- Grille des lits 2x2 -->
            <div class="cnd-beds-grid">
              <button
                v-for="bed in room.beds"
                :key="bed.id"
                type="button"
                :class="['cnd-bed-chip', `bed-status-${bed.status.toLowerCase()}`]"
                :title="`${bed.id} - ${bed.status} (Cliquer pour détails du lit)`"
                @click="openBedDetails(bed, room, 'hommes')"
              >
                <div class="cnd-bed-line">
                  <span :class="['cnd-dot', `dot-${bed.status.toLowerCase()}`]" />
                  <span class="cnd-bed-code">{{ bed.id }}</span>
                </div>
                <div class="cnd-bed-line">
                  <span :class="['cnd-status-text', `text-${bed.status.toLowerCase()}`]">
                    {{ bed.status }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Colonne 3 : Hôpital de jour (Rendez-vous ambulatoires sans nuitée) ── -->
      <section class="cnd-column col-hdj" id="col-hdj">
        <!-- Entête de colonne -->
        <div class="cnd-col-header header-hdj">
          <div class="cnd-col-title">
            <span class="cnd-col-icon-hdj">
              <AppIcon name="clock" :size="18" />
            </span>
            <span>Hôpital de jour (Ambulatoire)</span>
          </div>
          <span class="cnd-col-badge badge-hdj">Sans nuitée · 08h – 18h</span>
        </div>

        <!-- Bandeau d'information explicatif Ambulatoire -->
        <div class="cnd-ambulatory-banner">
          <AppIcon name="info" :size="16" style="flex-shrink:0; color:#0f766e" />
          <div>
            <strong>Rendez-vous & Venues du jour</strong>
            <p>
              Les patients viennent pour leur séance de soins programmée et repartent dormir à leur domicile.
            </p>
          </div>
        </div>

        <!-- Liste des rendez-vous et séances ambulatoires du jour -->
        <div class="cnd-hdj-sessions-list">
          <div
            v-for="session in roomsState.dayHospitalSessions"
            :key="session.id"
            class="cnd-hdj-session-card"
            :class="`status-${session.status.toLowerCase().replace(' ', '-')}`"
            @click="openHdjSession(session)"
            :title="`Cliquer pour gérer la séance de ${session.patient.name}`"
          >
            <!-- Ligne 1 : Créneau horaire + Statut ambulatoire -->
            <div class="cnd-hdj-top-row">
              <span class="cnd-hdj-slot-badge">
                <AppIcon name="clock" :size="13" />
                {{ session.slot }}
              </span>

              <span
                class="cnd-hdj-status-pill"
                :class="`status-pill-${session.status.toLowerCase().replace(' ', '-')}`"
              >
                ● {{ session.status }}
              </span>
            </div>

            <!-- Ligne 2 : Nom patient & Fauteuil de soin -->
            <div class="cnd-hdj-patient-line">
              <span class="cnd-hdj-patient-name">{{ session.patient.name }} ({{ session.patient.age }} ans)</span>
              <span class="cnd-hdj-chair-label">{{ session.chair }}</span>
            </div>

            <!-- Ligne 3 : Motif / Soin programmé -->
            <p class="cnd-hdj-care-text">{{ session.careType }}</p>

            <!-- Ligne 4 : Médecin / Soignant & rappel ambulatoire -->
            <div class="cnd-hdj-bottom-info">
              <span>{{ session.patient.doctor }} · {{ session.patient.nurse }}</span>
              <span class="cnd-hdj-notice-tag">
                <AppIcon name="home" :size="11" />
                Retour domicile
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- ── 5. Barre inférieure : Légende et devise de soins ── -->
    <div class="cnd-legend-bar">
      <!-- Légende des statuts (Gauche) -->
      <div class="cnd-legend-left">
        <div class="cnd-legend-title">
          <div class="cnd-legend-info-icon">
            <AppIcon name="info" :size="18" />
          </div>
          <strong>Légende des statuts</strong>
        </div>

        <div class="cnd-legend-items">
          <!-- Hospitalisation Complète : Libre -->
          <div class="cnd-legend-item">
            <span class="cnd-dot dot-libre" />
            <div class="cnd-legend-text">
              <strong class="text-libre">Lit Libre</strong>
              <small>Chambre disponible avec nuitée</small>
            </div>
          </div>

          <!-- Hospitalisation Complète : Occupé -->
          <div class="cnd-legend-item">
            <span class="cnd-dot dot-occupé" />
            <div class="cnd-legend-text">
              <strong class="text-occupé">Lit Occupé</strong>
              <small>Patient hospitalisé (séjour continu)</small>
            </div>
          </div>

          <!-- Hospitalisation Complète : Réservé -->
          <div class="cnd-legend-item">
            <span class="cnd-dot dot-réservé" />
            <div class="cnd-legend-text">
              <strong class="text-réservé">Lit Réservé</strong>
              <small>Arrivée prévue dans la journée</small>
            </div>
          </div>

          <!-- Hôpital de Jour : En soin -->
          <div class="cnd-legend-item">
            <span class="cnd-dot" style="background:#0d9488" />
            <div class="cnd-legend-text">
              <strong style="color:#0f766e">HDJ : En soin</strong>
              <small>Patient présent au fauteuil</small>
            </div>
          </div>

          <!-- Hôpital de Jour : Prévu -->
          <div class="cnd-legend-item">
            <span class="cnd-dot" style="background:#f59e0b" />
            <div class="cnd-legend-text">
              <strong style="color:#d97706">HDJ : Prévu</strong>
              <small>Rendez-vous ambulatoire à venir</small>
            </div>
          </div>

          <!-- Hôpital de Jour : Terminé -->
          <div class="cnd-legend-item">
            <span class="cnd-dot" style="background:#64748b" />
            <div class="cnd-legend-text">
              <strong style="color:#475569">HDJ : Terminé</strong>
              <small>Soin fini · Rentré à son domicile</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Devise / Slogan qualité (Droite) -->
      <div class="cnd-legend-right">
        <div class="cnd-slogan-box">
          <div class="cnd-slogan-icon">
            <AppIcon name="hospital" :size="24" />
          </div>
          <p class="cnd-slogan-text">
            Une bonne organisation<br>
            pour une meilleure qualité des soins
          </p>
        </div>
      </div>
    </div>

    <!-- ── 6. Modale interactive d'un lit d'hospitalisation complète (Hommes / Femmes) ── -->
    <div v-if="selectedBed" class="cnd-modal-overlay" @click.self="closeBedDetails">
      <div class="cnd-modal-content">
        <div class="cnd-modal-head">
          <div class="cnd-modal-title">
            <div class="cnd-modal-bed-badge">
              <AppIcon name="bed" :size="20" />
              <span>{{ selectedBed.id }}</span>
            </div>
            <div>
              <h3>{{ selectedRoom ? selectedRoom.name : 'Hospitalisation' }} · Lit {{ selectedBed.bedNum }}</h3>
              <span :class="['cnd-modal-status', `badge-status-${selectedBed.status.toLowerCase()}`]">
                ● {{ selectedBed.status }} (Hospitalisation complète)
              </span>
            </div>
          </div>
          <button type="button" class="cnd-modal-close" @click="closeBedDetails">
            <AppIcon name="x" :size="20" />
          </button>
        </div>

        <div class="cnd-modal-body">
          <!-- Si Occupé : informations patient -->
          <div v-if="selectedBed.status === 'Occupé' && selectedBed.patient" class="cnd-patient-card">
            <div class="cnd-patient-header">
              <div class="cnd-patient-avatar">
                {{ selectedBed.patient.name.split(' ').map(n=>n[0]).join('') }}
              </div>
              <div class="cnd-patient-meta">
                <h4>{{ selectedBed.patient.name }}</h4>
                <p>{{ selectedBed.patient.age }} ans · Admission le {{ selectedBed.patient.entryDate }}</p>
                <small>Médecin référent : {{ selectedBed.patient.doctor }}</small>
              </div>
            </div>

            <div class="cnd-patient-diag">
              <strong>Diagnostic médical / Surveillance :</strong>
              <p>{{ selectedBed.patient.diagnosis }}</p>
            </div>

            <div class="cnd-patient-actions">
              <AppButton @click="viewPatientRecord(selectedBed.patient.id)">
                Consulter le dossier de soins
              </AppButton>
              <AppButton variant="secondary" @click="handleStatusChange('Libre')">
                Libérer le lit (Sortie patient)
              </AppButton>
            </div>
          </div>

          <!-- Si Réservé : informations réservation -->
          <div v-else-if="selectedBed.status === 'Réservé'" class="cnd-reserve-card">
            <div class="cnd-reserve-info">
              <AppIcon name="clock" :size="24" style="color:#d97706" />
              <div>
                <strong>Réservation programmée :</strong>
                <p>{{ selectedBed.reservedFor || 'Arrivée d\'un patient prévue dans la journée' }}</p>
              </div>
            </div>

            <div class="cnd-reserve-actions">
              <AppButton @click="handleStatusChange('Occupé')">
                Valider l'admission (Marquer Occupé)
              </AppButton>
              <AppButton variant="secondary" @click="handleStatusChange('Libre')">
                Annuler la réservation
              </AppButton>
            </div>
          </div>

          <!-- Si Libre : options d'attribution -->
          <div v-else class="cnd-free-card">
            <div class="cnd-free-info">
              <AppIcon name="check" :size="24" style="color:#16a34a" />
              <div>
                <strong>Lit disponible pour admission immédiate</strong>
                <p>Ce lit est propre, désinfecté et prêt à accueillir un nouveau patient en hospitalisation complète.</p>
              </div>
            </div>

            <div class="cnd-free-actions">
              <AppButton @click="router.push({ name: 'patients-add' })">
                Assigner un nouveau patient
              </AppButton>
              <AppButton variant="secondary" @click="handleStatusChange('Réservé')">
                Mettre en réservation
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 7. Modale interactive spécifique Hôpital de Jour (Rendez-vous ambulatoires sans nuitée) ── -->
    <div v-if="selectedHdjSession" class="cnd-modal-overlay" @click.self="closeHdjSession">
      <div class="cnd-modal-content">
        <div class="cnd-modal-head">
          <div class="cnd-modal-title">
            <div class="cnd-modal-bed-badge cnd-modal-ambulatory-badge">
              <AppIcon name="clock" :size="20" />
              <span>{{ selectedHdjSession.slot }}</span>
            </div>
            <div>
              <h3>Hôpital de jour · {{ selectedHdjSession.chair }}</h3>
              <span :class="['cnd-hdj-status-pill', `status-pill-${selectedHdjSession.status.toLowerCase().replace(' ', '-')}`]">
                ● {{ selectedHdjSession.status }} (Ambulatoire)
              </span>
            </div>
          </div>
          <button type="button" class="cnd-modal-close" @click="closeHdjSession">
            <AppIcon name="x" :size="20" />
          </button>
        </div>

        <div class="cnd-modal-body">
          <!-- Avertissement explicite Ambulatoire sans nuitée -->
          <div class="cnd-ambulatory-alert">
            <AppIcon name="info" :size="20" style="color:#2563eb; flex-shrink:0" />
            <div>
              <strong>Prise en charge ambulatoire (Sans nuitée)</strong>
              <p style="margin:2px 0 0; font-size:11px;">
                Ce patient vient à l'hôpital uniquement pour son rendez-vous et sa séance de soins.
                Il ne reste pas dormir à l'hôpital et rentre chez lui après la séance.
              </p>
            </div>
          </div>

          <!-- Fiche patient HDJ -->
          <div class="cnd-patient-card">
            <div class="cnd-patient-header">
              <div class="cnd-patient-avatar" style="background: linear-gradient(135deg, #0d9488, #0f766e); color:#ffffff;">
                {{ selectedHdjSession.patient.name.split(' ').map(n=>n[0]).join('') }}
              </div>
              <div class="cnd-patient-meta">
                <h4>{{ selectedHdjSession.patient.name }}</h4>
                <p>{{ selectedHdjSession.patient.age }} ans · N° {{ selectedHdjSession.patient.id }}</p>
                <small>Médecin prescripteur : {{ selectedHdjSession.patient.doctor }} · Référent : {{ selectedHdjSession.patient.nurse }}</small>
              </div>
            </div>

            <!-- Grille de détails de la séance ambulatoire -->
            <div class="cnd-ambulatory-details-grid">
              <div class="cnd-ambulatory-detail-box">
                <small>Acte / Motif de la séance</small>
                <strong>{{ selectedHdjSession.careType }}</strong>
              </div>
              <div class="cnd-ambulatory-detail-box">
                <small>Créneau horaire & Poste</small>
                <strong>{{ selectedHdjSession.slot }} · {{ selectedHdjSession.chair }}</strong>
              </div>
              <div class="cnd-ambulatory-detail-box">
                <small>Arrivée patient</small>
                <strong>{{ selectedHdjSession.patient.arrivalTime }}</strong>
              </div>
              <div class="cnd-ambulatory-detail-box">
                <small>Retour au domicile</small>
                <strong>{{ selectedHdjSession.patient.departureTime }}</strong>
              </div>
            </div>

            <div class="cnd-patient-diag">
              <strong>Protocole & Surveillance :</strong>
              <p>{{ selectedHdjSession.patient.diagnosis }}</p>
              <p style="margin-top:4px; color:#475569; font-style:italic;">« {{ selectedHdjSession.notes }} »</p>
            </div>

            <div class="cnd-patient-actions">
              <AppButton
                v-if="selectedHdjSession.status === 'Prévu'"
                @click="handleHdjStatusChange(selectedHdjSession, 'En soin')"
              >
                Accueillir le patient & Démarrer le soin
              </AppButton>

              <AppButton
                v-else-if="selectedHdjSession.status === 'En soin'"
                @click="handleHdjStatusChange(selectedHdjSession, 'Terminé')"
              >
                Valider la fin de séance (Sortie / Retour à domicile)
              </AppButton>

              <AppButton
                v-else
                variant="secondary"
                @click="handleHdjStatusChange(selectedHdjSession, 'En soin')"
              >
                Remettre la séance en cours
              </AppButton>

              <AppButton variant="secondary" @click="viewPatientRecord(selectedHdjSession.patient.id)">
                Consulter le dossier de soins
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

