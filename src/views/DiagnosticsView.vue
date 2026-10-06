<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useNurses } from '@/composables/useNurses'
import { useToast } from '@/composables/useToast'
import { apiCreateDiagnostic, apiDeleteDiagnostic, apiUpdateDiagnostic } from '@/services/api'

const DIAGNOSTICS_STORAGE_KEY = 'nurseflow_diagnostics'

function loadSavedDiagnostics() {
  try {
    const raw = localStorage.getItem(DIAGNOSTICS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

function persistDiagnostics(value) {
  try {
    localStorage.setItem(DIAGNOSTICS_STORAGE_KEY, JSON.stringify(value))
  } catch (error) {}
}

const { activeNurse, logActivity } = useNurses()
const { notify } = useToast()

// ── Données complètes PES ─────────────────────────────────────────────────
const diagnostics = ref([
  {
    id: 1,
    code: 'NANDA-00132',
    // PES
    probleme:  'Douleur aiguë',
    etiologie: 'Intervention chirurgicale récente, inflammation post-opératoire',
    symptomes: 'EVA 6/10, verbalisation de la douleur, grimaces à la mobilisation, FC 98/min',
    // Recueil des données
    antecedents: 'Appendicectomie J1, pas d\'allergie connue',
    constantes: 'PA 130/85, FC 98, FR 18, T° 37,8°C, SpO2 98%',
    observations: 'Patient conscient, algique, refuse de se mobiliser',
    // Analyse
    domain: 'Confort',
    priority: 'haute',
    status: 'actif',
    nurseName: 'Salima Mansouri',
    createdAt: '2026-10-04',
    patient: 'Amine Mansouri',
    // NIC / NOC
    interventions: [
      'Évaluation de la douleur EVA toutes les 2h',
      'Administration des antalgiques prescrits (Paracétamol 1g IV)',
      'Positionnement antalgique, oreiller de maintien',
      'Éducation du patient sur les techniques de gestion de la douleur',
    ],
    outcomes: 'Réduction de la douleur à EVA ≤ 3/10 dans les 24h',
    // Validation
    validated: true,
    validationNote: 'Diagnostic confirmé par l\'infirmière et le médecin référent',
  },
  {
    id: 2,
    code: 'NANDA-00092',
    probleme:  'Intolérance à l\'activité',
    etiologie: 'Alitement prolongé, faiblesse musculaire généralisée',
    symptomes: 'Fatigue intense à l\'effort, FC > 110/min après mobilisation, dyspnée d\'effort',
    antecedents: 'Hospitalisation de 5 jours, pas d\'activité physique récente',
    constantes: 'PA 120/75, FC 88 au repos → 115 à l\'effort, FR 16, T° 37,1°C',
    observations: 'Patient motivé mais épuisé après quelques pas, saturation stable',
    domain: 'Activité / Repos',
    priority: 'moyenne',
    status: 'actif',
    nurseName: 'Thomas Dubois',
    createdAt: '2026-10-04',
    patient: 'Amine Mansouri',
    interventions: [
      'Mobilisation progressive au fauteuil 2×/jour avec assistance',
      'Surveillance hémodynamique avant et après l\'effort',
      'Éducation sur la gestion des économies d\'énergie',
      'Coordination avec kinésithérapeute pour rééducation',
    ],
    outcomes: 'Tolérance à l\'activité augmentée, marche autonome de 10m sans dyspnée',
    validated: false,
    validationNote: '',
  },
  {
    id: 3,
    code: 'NANDA-00015',
    probleme:  'Risque d\'infection',
    etiologie: 'Voie veineuse périphérique en place, immunodépression relative',
    symptomes: 'Rougeur péri-site VVP, légère chaleur locale, pas de fièvre',
    antecedents: 'VVP posée depuis 48h bras gauche, diabète type 2',
    constantes: 'T° 37,2°C, GB 11 500/mm³ (légère hyperleucocytose)',
    observations: 'Œdème discret autour du site de perfusion, patient signale une gêne',
    domain: 'Sécurité / Protection',
    priority: 'haute',
    status: 'surveillance',
    nurseName: 'Salima Mansouri',
    createdAt: '2026-10-03',
    patient: 'Amine Mansouri',
    interventions: [
      'Surveillance du site de ponction toutes les 4h',
      'Asepsie rigoureuse lors de chaque manipulation',
      'Changement du pansement selon protocole (72h max)',
      'Signalement immédiat de tout signe d\'infection systémique',
    ],
    outcomes: 'Absence de signes d\'infection locale ou systémique, VVP fonctionnelle',
    validated: true,
    validationNote: 'Surveillance accrue prescrite par le médecin',
  },
])

const savedDiagnostics = loadSavedDiagnostics()
if (savedDiagnostics) diagnostics.value = savedDiagnostics
watch(diagnostics, persistDiagnostics, { deep: true })

// ── États UI ───────────────────────────────────────────────────────────────
const showForm   = ref(false)
const expandedId = ref(null)
const editingId  = ref(null)
const filterStatus = ref('tous')

// ── Formulaire nouveau diagnostic ─────────────────────────────────────────
const emptyForm = () => ({
  code: '', probleme: '', etiologie: '', symptomes: '',
  antecedents: '', constantes: '', observations: '',
  domain: '', priority: 'moyenne', outcomes: '', interventions: '',
  validationNote: '',
})
const newDiag  = ref(emptyForm())
const editForm = ref(emptyForm())

const domains = [
  'Activité / Repos', 'Confort', 'Croissance / Développement',
  'Élimination', 'Nutrition', 'Perception / Cognition',
  'Rôle / Relation', 'Sécurité / Protection', 'Sexualité', 'Tolérance au stress',
]

// ── Computed ───────────────────────────────────────────────────────────────
const filteredDiagnostics = computed(() => {
  if (filterStatus.value === 'tous') return diagnostics.value
  return diagnostics.value.filter(d => d.status === filterStatus.value)
})

// ── Actions ────────────────────────────────────────────────────────────────
function toggleExpand(id) {
  if (editingId.value === id) return
  expandedId.value = expandedId.value === id ? null : id
}

function submitDiag() {
  if (!newDiag.value.probleme.trim()) return
  const d = {
    id: Date.now(),
    code: newDiag.value.code || 'NANDA-XXXXX',
    probleme:    newDiag.value.probleme,
    etiologie:   newDiag.value.etiologie,
    symptomes:   newDiag.value.symptomes,
    antecedents: newDiag.value.antecedents,
    constantes:  newDiag.value.constantes,
    observations:newDiag.value.observations,
    domain:      newDiag.value.domain || 'Non classé',
    priority:    newDiag.value.priority,
    status:      'actif',
    nurseName:   activeNurse.value.name,
    createdAt:   new Date().toISOString().split('T')[0],
    patient:     'Amine Mansouri',
    interventions: newDiag.value.interventions.split('\n').map(s => s.trim()).filter(Boolean),
    outcomes:    newDiag.value.outcomes,
    validated:   false,
    validationNote: newDiag.value.validationNote,
  }
  diagnostics.value.unshift(d)
  apiCreateDiagnostic(d).catch(() => {})
  logActivity({
    type: 'diagnostic',
    action: 'Diagnostic infirmier posé',
    target: `${d.probleme} (${d.code})`,
    entity: 'diagnostic',
    entityId: d.id,
    details: { priority: d.priority, domain: d.domain },
  })
  notify(`Diagnostic posé : ${d.probleme}`)
  newDiag.value = emptyForm()
  showForm.value = false
}

function startEdit(d) {
  editingId.value = d.id
  expandedId.value = d.id
  editForm.value = {
    code:          d.code,
    probleme:      d.probleme,
    etiologie:     d.etiologie,
    symptomes:     d.symptomes,
    antecedents:   d.antecedents,
    constantes:    d.constantes,
    observations:  d.observations,
    domain:        d.domain,
    priority:      d.priority,
    outcomes:      d.outcomes,
    interventions: Array.isArray(d.interventions) ? d.interventions.join('\n') : d.interventions,
    validationNote: d.validationNote || '',
  }
}

function saveEdit(d) {
  if (!editForm.value.probleme.trim()) return
  const idx = diagnostics.value.findIndex(x => x.id === d.id)
  if (idx === -1) return
  diagnostics.value[idx] = {
    ...diagnostics.value[idx],
    code:          editForm.value.code,
    probleme:      editForm.value.probleme,
    etiologie:     editForm.value.etiologie,
    symptomes:     editForm.value.symptomes,
    antecedents:   editForm.value.antecedents,
    constantes:    editForm.value.constantes,
    observations:  editForm.value.observations,
    domain:        editForm.value.domain,
    priority:      editForm.value.priority,
    outcomes:      editForm.value.outcomes,
    interventions: editForm.value.interventions.split('\n').map(s => s.trim()).filter(Boolean),
    validationNote: editForm.value.validationNote,
    nurseName:     activeNurse.value.name,
  }
  apiUpdateDiagnostic(d.id, diagnostics.value[idx]).catch(() => {})
  logActivity({
    type: 'diagnostic',
    action: 'Diagnostic modifié',
    target: `${editForm.value.probleme} (${editForm.value.code})`,
    entity: 'diagnostic',
    entityId: d.id,
    changes: { before: d, after: diagnostics.value[idx] },
  })
  notify(`Diagnostic mis à jour : ${editForm.value.probleme}`)
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

function deleteDiag(d) {
  if (!confirm(`Supprimer le diagnostic "${d.probleme}" ?`)) return
  diagnostics.value = diagnostics.value.filter(x => x.id !== d.id)
  apiDeleteDiagnostic(d.id).catch(() => {})
  if (expandedId.value === d.id) expandedId.value = null
  logActivity({
    type: 'diagnostic',
    action: 'Diagnostic supprimé',
    target: `${d.probleme} (${d.code})`,
    entity: 'diagnostic',
    entityId: d.id,
    details: { status: d.status },
  })
  notify(`Diagnostic supprimé.`)
}

function resolveStatus(d) {
  d.status = 'résolu'
  apiUpdateDiagnostic(d.id, d).catch(() => {})
  notify(`Diagnostic "${d.probleme}" marqué comme résolu.`)
  logActivity({
    type: 'diagnostic',
    action: 'Diagnostic résolu',
    target: `${d.probleme} (${d.code})`,
    entity: 'diagnostic',
    entityId: d.id,
  })
}

function priorityClass(p) {
  return p === 'haute' ? 'prio-haute' : p === 'basse' ? 'prio-basse' : 'prio-moyenne'
}
function statusClass(s) {
  return s === 'actif' ? 'diag-actif' : s === 'surveillance' ? 'diag-surv' : 'diag-resolu'
}
</script>

<template>
  <div class="diag-view">
    <!-- En-tête -->
    <div class="diag-header">
      <div>
        <h2 class="diag-title">
          <AppIcon name="stethoscope" :size="22" style="color:var(--primary)" />
          Diagnostics infirmiers
        </h2>
        <p class="diag-sub">Modèle PES · NANDA · NIC · NOC · Recueil de données</p>
      </div>
      <AppButton icon="plus" @click="showForm = !showForm">
        {{ showForm ? 'Annuler' : 'Nouveau diagnostic' }}
      </AppButton>
    </div>

    <!-- Référentiel méthodologique -->
    <div class="pes-reminder">
      <div class="pes-item">
        <span class="pes-badge pes-p">P</span>
        <div><strong>Problème</strong><small>Le diagnostic infirmier identifié</small></div>
      </div>
      <div class="pes-sep">→</div>
      <div class="pes-item">
        <span class="pes-badge pes-e">E</span>
        <div><strong>Étiologie</strong><small>La cause / facteur déclenchant</small></div>
      </div>
      <div class="pes-sep">→</div>
      <div class="pes-item">
        <span class="pes-badge pes-s">S</span>
        <div><strong>Signes &amp; Symptômes</strong><small>Les manifestations observées</small></div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="diag-filters">
      <button
        v-for="f in ['tous','actif','surveillance','résolu']"
        :key="f"
        :class="['diag-filter-btn', filterStatus === f ? 'active' : '']"
        @click="filterStatus = f"
      >
        {{ f.charAt(0).toUpperCase() + f.slice(1) }}
        <span v-if="f === 'tous'" class="diag-filter-count">{{ diagnostics.length }}</span>
        <span v-else class="diag-filter-count">{{ diagnostics.filter(d => d.status === f).length }}</span>
      </button>
    </div>

    <!-- ── FORMULAIRE NOUVEAU DIAGNOSTIC ── -->
    <div v-if="showForm" class="diag-form-card">
      <h3><AppIcon name="clipboard" :size="16" /> Poser un nouveau diagnostic infirmier (PES)</h3>
      <form @submit.prevent="submitDiag">

        <!-- 1. Recueil des données -->
        <div class="diag-form-section">
          <div class="diag-form-section-title">
            <span class="diag-step">1</span> Recueil des données patient
          </div>
          <div class="grid-2">
            <label class="field">
              <span>Code NANDA</span>
              <input v-model="newDiag.code" placeholder="Ex : NANDA-00132" />
            </label>
            <label class="field">
              <span>Domaine</span>
              <select v-model="newDiag.domain">
                <option value="">-- Sélectionner --</option>
                <option v-for="d in domains" :key="d">{{ d }}</option>
              </select>
            </label>
          </div>
          <div class="grid-2">
            <label class="field">
              <span>Antécédents pertinents</span>
              <textarea v-model="newDiag.antecedents" rows="2" placeholder="Antécédents médicaux, chirurgicaux, allergies…" />
            </label>
            <label class="field">
              <span>Constantes vitales</span>
              <textarea v-model="newDiag.constantes" rows="2" placeholder="PA, FC, FR, T°, SpO2…" />
            </label>
          </div>
          <label class="field">
            <span>Observations cliniques</span>
            <textarea v-model="newDiag.observations" rows="2" placeholder="État général, comportement, signes observés…" />
          </label>
        </div>

        <!-- 2. Formulation PES -->
        <div class="diag-form-section">
          <div class="diag-form-section-title">
            <span class="diag-step">2</span> Formulation du diagnostic — Modèle PES
          </div>
          <label class="field">
            <span class="pes-field-label pes-p-label">P — Problème (libellé du diagnostic) *</span>
            <input v-model="newDiag.probleme" placeholder="Ex : Douleur aiguë, Risque d'infection, Intolérance à l'activité…" required />
          </label>
          <label class="field">
            <span class="pes-field-label pes-e-label">E — Étiologie (lié à…)</span>
            <input v-model="newDiag.etiologie" placeholder="Ex : Lié à : inflammation post-opératoire, alitement prolongé…" />
          </label>
          <label class="field">
            <span class="pes-field-label pes-s-label">S — Signes &amp; Symptômes (manifesté par…)</span>
            <textarea v-model="newDiag.symptomes" rows="2" placeholder="Ex : Manifesté par : EVA 6/10, grimaces, refus de mobilisation, FC élevée…" />
          </label>
        </div>

        <!-- 3. Planification -->
        <div class="diag-form-section">
          <div class="diag-form-section-title">
            <span class="diag-step">3</span> Planification des soins (NIC / NOC)
          </div>
          <div class="grid-2">
            <label class="field">
              <span>Priorité</span>
              <select v-model="newDiag.priority">
                <option value="haute">🔴 Haute</option>
                <option value="moyenne">🟡 Moyenne</option>
                <option value="basse">🟢 Basse</option>
              </select>
            </label>
            <label class="field">
              <span>Résultats attendus (NOC)</span>
              <input v-model="newDiag.outcomes" placeholder="Ex : EVA ≤ 3/10 dans les 24h" />
            </label>
          </div>
          <label class="field">
            <span>Interventions infirmières NIC (une par ligne)</span>
            <textarea v-model="newDiag.interventions" rows="4"
              placeholder="Évaluation de la douleur EVA toutes les 2h&#10;Administration des antalgiques prescrits&#10;Positionnement antalgique…" />
          </label>
        </div>

        <!-- 4. Validation -->
        <div class="diag-form-section">
          <div class="diag-form-section-title">
            <span class="diag-step">4</span> Validation du diagnostic
          </div>
          <label class="field">
            <span>Note de validation / justification clinique</span>
            <input v-model="newDiag.validationNote" placeholder="Ex : Confirmé par le médecin référent, données cohérentes avec le dossier…" />
          </label>
        </div>

        <div class="diag-form-actions">
          <AppButton variant="secondary" type="button" @click="showForm = false">Annuler</AppButton>
          <AppButton type="submit" icon="check">Enregistrer le diagnostic</AppButton>
        </div>
      </form>
    </div>

    <!-- ── LISTE DES DIAGNOSTICS ── -->
    <div class="diag-list">
      <div
        v-for="d in filteredDiagnostics"
        :key="d.id"
        :class="['diag-card', `diag-card--${d.priority}`]"
      >
        <!-- Header de la carte -->
        <div class="diag-card-header" @click="editingId !== d.id && toggleExpand(d.id)">
          <div class="diag-card-left">
            <span :class="['diag-prio', priorityClass(d.priority)]">
              {{ d.priority.charAt(0).toUpperCase() + d.priority.slice(1) }}
            </span>
            <div>
              <div class="diag-card-title">
                <strong>{{ d.probleme }}</strong>
                <code class="diag-code">{{ d.code }}</code>
                <span :class="['diag-status', statusClass(d.status)]">{{ d.status }}</span>
                <span v-if="d.validated" class="diag-validated" title="Diagnostic validé">✓ Validé</span>
              </div>
              <small class="diag-meta">
                {{ d.domain }} · Par {{ d.nurseName }} · {{ d.createdAt }}
              </small>
            </div>
          </div>
          <div class="diag-card-right">
            <!-- Actions -->
            <button
              v-if="d.status !== 'résolu'"
              class="btn-resolve"
              type="button"
              @click.stop="resolveStatus(d)"
            >
              <AppIcon name="check" :size="13" /> Résoudre
            </button>
            <button class="diag-action-btn diag-edit-btn" type="button" title="Modifier" @click.stop="startEdit(d)">
              <AppIcon name="edit" :size="14" />
            </button>
            <button class="diag-action-btn diag-del-btn" type="button" title="Supprimer" @click.stop="deleteDiag(d)">
              <AppIcon name="trash" :size="14" />
            </button>
            <span class="diag-expand-icon">
              <AppIcon :name="expandedId === d.id ? 'x' : 'chevron'" :size="16" />
            </span>
          </div>
        </div>

        <!-- ── MODE ÉDITION ── -->
        <div v-if="editingId === d.id" class="diag-edit-panel">
          <div class="diag-form-section">
            <div class="diag-form-section-title"><span class="diag-step">1</span> Recueil des données</div>
            <div class="grid-2">
              <label class="field"><span>Code NANDA</span>
                <input v-model="editForm.code" />
              </label>
              <label class="field"><span>Domaine</span>
                <select v-model="editForm.domain">
                  <option v-for="dom in domains" :key="dom">{{ dom }}</option>
                </select>
              </label>
            </div>
            <div class="grid-2">
              <label class="field"><span>Antécédents</span>
                <textarea v-model="editForm.antecedents" rows="2" />
              </label>
              <label class="field"><span>Constantes vitales</span>
                <textarea v-model="editForm.constantes" rows="2" />
              </label>
            </div>
            <label class="field"><span>Observations</span>
              <textarea v-model="editForm.observations" rows="2" />
            </label>
          </div>

          <div class="diag-form-section">
            <div class="diag-form-section-title"><span class="diag-step">2</span> Formulation PES</div>
            <label class="field">
              <span class="pes-field-label pes-p-label">P — Problème *</span>
              <input v-model="editForm.probleme" required />
            </label>
            <label class="field">
              <span class="pes-field-label pes-e-label">E — Étiologie</span>
              <input v-model="editForm.etiologie" />
            </label>
            <label class="field">
              <span class="pes-field-label pes-s-label">S — Signes &amp; Symptômes</span>
              <textarea v-model="editForm.symptomes" rows="2" />
            </label>
          </div>

          <div class="diag-form-section">
            <div class="diag-form-section-title"><span class="diag-step">3</span> Planification</div>
            <div class="grid-2">
              <label class="field"><span>Priorité</span>
                <select v-model="editForm.priority">
                  <option value="haute">🔴 Haute</option>
                  <option value="moyenne">🟡 Moyenne</option>
                  <option value="basse">🟢 Basse</option>
                </select>
              </label>
              <label class="field"><span>Résultats attendus (NOC)</span>
                <input v-model="editForm.outcomes" />
              </label>
            </div>
            <label class="field"><span>Interventions NIC (une par ligne)</span>
              <textarea v-model="editForm.interventions" rows="4" />
            </label>
          </div>

          <div class="diag-form-section">
            <div class="diag-form-section-title"><span class="diag-step">4</span> Validation</div>
            <label class="field"><span>Note de validation</span>
              <input v-model="editForm.validationNote" />
            </label>
          </div>

          <div class="diag-edit-actions">
            <button type="button" class="btn-cancel-edit" @click="cancelEdit">Annuler</button>
            <button type="button" class="btn-save-edit" @click="saveEdit(d)">
              <AppIcon name="check" :size="13" /> Enregistrer les modifications
            </button>
          </div>
        </div>

        <!-- ── MODE LECTURE (développé) ── -->
        <div v-else-if="expandedId === d.id" class="diag-card-body">
          <!-- PES résumé -->
          <div class="pes-summary">
            <div class="pes-sum-item">
              <span class="pes-badge pes-p">P</span>
              <div>
                <small class="diag-detail-label">Problème</small>
                <p>{{ d.probleme }}</p>
              </div>
            </div>
            <div class="pes-sum-item">
              <span class="pes-badge pes-e">E</span>
              <div>
                <small class="diag-detail-label">Étiologie</small>
                <p>{{ d.etiologie || '—' }}</p>
              </div>
            </div>
            <div class="pes-sum-item">
              <span class="pes-badge pes-s">S</span>
              <div>
                <small class="diag-detail-label">Signes &amp; Symptômes</small>
                <p>{{ d.symptomes || '—' }}</p>
              </div>
            </div>
          </div>

          <div class="diag-detail-grid">
            <div class="diag-detail-row">
              <span class="diag-detail-label">Antécédents</span>
              <p>{{ d.antecedents || '—' }}</p>
            </div>
            <div class="diag-detail-row">
              <span class="diag-detail-label">Constantes vitales</span>
              <p>{{ d.constantes || '—' }}</p>
            </div>
            <div class="diag-detail-row">
              <span class="diag-detail-label">Observations</span>
              <p>{{ d.observations || '—' }}</p>
            </div>
            <div class="diag-detail-row">
              <span class="diag-detail-label">Résultats attendus (NOC)</span>
              <p>{{ d.outcomes || '—' }}</p>
            </div>
            <div class="diag-detail-row" style="grid-column:1/-1">
              <span class="diag-detail-label">Interventions NIC</span>
              <ul>
                <li v-for="(inter, i) in d.interventions" :key="i">{{ inter }}</li>
              </ul>
            </div>
            <div v-if="d.validationNote" class="diag-detail-row" style="grid-column:1/-1">
              <span class="diag-detail-label">Note de validation</span>
              <p class="validation-note">{{ d.validationNote }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredDiagnostics.length === 0" class="diag-empty">
        <AppIcon name="clipboard" :size="36" style="opacity:.3;margin-bottom:12px" />
        <p>Aucun diagnostic dans cette catégorie.</p>
      </div>
    </div>
  </div>
</template>
