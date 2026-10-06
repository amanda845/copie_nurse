<script setup>
import { ref, computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import TreatmentRow from './TreatmentRow.vue'
import TreatmentFormModal from './TreatmentFormModal.vue'
import AdminStatusModal from './AdminStatusModal.vue'
import { useTreatments } from '@/composables/useTreatments'
import { useToast } from '@/composables/useToast'
import { useNurses } from '@/composables/useNurses'

const props = defineProps({
  compact: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
})

const {
  treatments,
  upcomingCount,
  getLastAdministration,
  addTreatment,
  updateTreatment,
  deleteTreatment,
  setAdministrationStatus,
} = useTreatments()

const { notify } = useToast()
const { activeNurse, logActivity } = useNurses()

const hours = ['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07']

// ── Modales ──────────────────────────────────────────────────────────────────
const treatmentModal = ref(null)  // null | { mode: 'add'|'edit', treatment: null|{} }
const adminModal    = ref(null)  // null | { treatment: {}, hour: '' }
const confirmDelete = ref(null)  // null | treatment

const lastAdmin = computed(() => getLastAdministration())

// ── Actions traitement ────────────────────────────────────────────────────────
function openAdd() {
  treatmentModal.value = { mode: 'add', treatment: null }
}
function openEdit(t) {
  treatmentModal.value = { mode: 'edit', treatment: t }
}
function closeTreatmentModal() {
  treatmentModal.value = null
}
function submitTreatmentModal(data) {
  if (treatmentModal.value.mode === 'add') {
    const treatmentId = addTreatment(data)
    logActivity({
      type: 'treatment',
      action: 'Traitement ajouté au planning',
      target: `${data.name} ${data.dosage} · ${data.route}`,
      entity: 'treatment',
      entityId: treatmentId,
      details: { scheduled: data.scheduled },
    })
    notify('Traitement ajouté avec succès')
  } else {
    const treatmentId = treatmentModal.value.treatment.id
    updateTreatment(treatmentId, data)
    logActivity({
      type: 'treatment',
      action: 'Traitement modifié',
      target: `${data.name} ${data.dosage} · ${data.route}`,
      entity: 'treatment',
      entityId: treatmentId,
      changes: { before: treatmentModal.value.treatment, after: data },
    })
    notify('Traitement mis à jour')
  }
  treatmentModal.value = null
}

function askDelete(t) {
  confirmDelete.value = t
}
function doDelete() {
  if (!confirmDelete.value) return
  const treatment = confirmDelete.value
  deleteTreatment(treatment.id)
  logActivity({
    type: 'treatment',
    action: 'Traitement supprimé du planning',
    target: `${treatment.name} ${treatment.dosage} · ${treatment.route}`,
    entity: 'treatment',
    entityId: treatment.id,
    details: { scheduled: treatment.scheduled },
  })
  notify('Traitement supprimé')
  confirmDelete.value = null
}

// ── Actions administration ────────────────────────────────────────────────────
function openAdminModal({ treatment, hour }) {
  adminModal.value = { treatment, hour }
}
function closeAdminModal() {
  adminModal.value = null
}
function submitAdminModal({ status, note, nurse, nurseId, nurseFullName }) {
  const { treatment, hour } = adminModal.value
  const administeringNurse = nurse || activeNurse.value.shortName || activeNurse.value.name
  setAdministrationStatus(treatment.id, hour, status, administeringNurse, note)
  
  if (status === 'done') {
    notify(`Administration validée par ${administeringNurse}`)
    logActivity({
      nurseId: nurseId || activeNurse.value.id,
      nurseName: nurseFullName || activeNurse.value.name,
      type: 'treatment',
      action: 'Administration effectuée',
      target: `${treatment.name} ${treatment.dosage} · ${treatment.route} (${hour}h)`,
    })
  } else if (status === null) {
    notify('Administration effacée')
    logActivity({
      nurseId: nurseId || activeNurse.value.id,
      nurseName: nurseFullName || activeNurse.value.name,
      type: 'treatment',
      action: 'Prise effacée / réinitialisée',
      target: `${treatment.name} (${hour}h)`,
    })
  } else {
    notify(`Statut mis à jour : ${status}`)
    logActivity({
      nurseId: nurseId || activeNurse.value.id,
      nurseName: nurseFullName || activeNurse.value.name,
      type: 'treatment',
      action: `Statut : ${status}`,
      target: `${treatment.name} (${hour}h)`,
    })
  }
  adminModal.value = null
}
</script>

<template>
  <div :class="`treatment-timeline ${compact ? 'compact' : ''} ${editable ? '' : 'read-only'}`">

    <!-- Header -->
    <div v-if="!compact" class="panel-header">
      <div>
        <h2>Planning des traitements</h2>
        <p>Administration sur 24 heures</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="timeline-legend">
          <span><i class="complete" /> Administré</span>
          <span><i class="pending" /> Planifié</span>
          <span><i class="skipped-dot" /> Reporté</span>
          <span><i class="missed" /> Annulé</span>
        </div>
        <AppBadge v-if="upcomingCount > 0" :status="`${upcomingCount} à venir`" />
        <AppButton v-if="editable" icon="plus" @click="openAdd">Ajouter</AppButton>
      </div>
    </div>

    <!-- Tableau -->
    <div class="timeline-scroll">
      <div class="hours-row">
        <span>Traitement</span>
        <b v-for="h in hours" :key="h">{{ h }}</b>
      </div>

      <div v-if="treatments.length === 0" class="empty-state" style="padding:30px 18px">
        <span><AppIcon name="pill" /></span>
        <h3>Aucun traitement</h3>
        <p>Cliquez sur « Ajouter » pour prescrire un premier traitement.</p>
      </div>

      <TreatmentRow
        v-for="t in treatments"
        :key="t.id"
        :treatment="t"
        :all-hours="hours"
        :editable="editable"
        @click-dose="openAdminModal"
        @edit="openEdit"
        @delete="askDelete"
      />
    </div>

    <!-- Note bas de page -->
    <div class="timeline-note">
      <AppIcon name="user" :size="16" />
      <template v-if="lastAdmin">
        Dernière administration par <strong>{{ lastAdmin.by }}</strong> à {{ lastAdmin.at }}
      </template>
      <template v-else>
        Aucune administration enregistrée aujourd'hui
      </template>
    </div>

    <!-- Modales -->
    <TreatmentFormModal
      v-if="treatmentModal"
      :mode="treatmentModal.mode"
      :treatment="treatmentModal.treatment"
      @close="closeTreatmentModal"
      @submit="submitTreatmentModal"
    />

    <AdminStatusModal
      v-if="adminModal"
      :treatment="adminModal.treatment"
      :hour="adminModal.hour"
      @close="closeAdminModal"
      @submit="submitAdminModal"
    />

    <!-- Confirmation suppression -->
    <div v-if="confirmDelete" class="modal-backdrop" @mousedown="confirmDelete = null">
      <div class="modal confirm-modal" @mousedown.stop>
        <header>
          <div>
            <span style="background:#fef2f2;color:#b91c1c"><AppIcon name="alert" /></span>
            <div>
              <h2>Supprimer le traitement ?</h2>
              <p>Cette action est irréversible.</p>
            </div>
          </div>
          <button type="button" class="icon-btn" @click="confirmDelete = null">
            <AppIcon name="x" />
          </button>
        </header>
        <div class="modal-body">
          <p style="font-size:13px;color:#536175">
            Voulez-vous vraiment supprimer <strong>{{ confirmDelete.name }}</strong>
            ({{ confirmDelete.dosage }} · {{ confirmDelete.route }}) ?
            Toutes les administrations associées seront également supprimées.
          </p>
        </div>
        <footer>
          <AppButton variant="secondary" @click="confirmDelete = null">Annuler</AppButton>
          <AppButton variant="danger" icon="x" @click="doDelete">Supprimer</AppButton>
        </footer>
      </div>
    </div>

  </div>
</template>
