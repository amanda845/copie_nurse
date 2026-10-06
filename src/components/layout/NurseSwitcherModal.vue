<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppAvatar from '@/components/common/AppAvatar.vue'
import { useNurses } from '@/composables/useNurses'
import { useToast } from '@/composables/useToast'

const emit = defineEmits(['close'])
const router = useRouter()
const { nurses, activeNurse, setActiveNurse, addNurse, removeNurse, updateNurse } = useNurses()
const { notify } = useToast()

const showAddForm = ref(false)
const searchQuery = ref('')

const filteredNurses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return nurses.value
  return nurses.value.filter(n =>
    n.name.toLowerCase().includes(q) ||
    n.role.toLowerCase().includes(q) ||
    n.service.toLowerCase().includes(q)
  )
})
const newName = ref('')
const newRole = ref('Infirmier(e) DE')
const newService = ref('Service Médecine 2')
const newBadge = ref('')

// Édition
const editingId = ref(null)
const editName = ref('')
const editRole = ref('')
const editService = ref('')
const editBadge = ref('')

function selectNurse(n) {
  setActiveNurse(n.id)
  notify(`Prise de poste : ${n.name} (${n.role})`)
  emit('close')
}

function handleAddNurse() {
  if (!newName.value.trim()) return
  const created = addNurse({
    name: newName.value,
    role: newRole.value,
    service: newService.value,
    badge: newBadge.value,
  })
  setActiveNurse(created.id)
  notify(`Nouveau soignant enregistré : ${created.name}`)
  newName.value = ''
  newBadge.value = ''
  showAddForm.value = false
  emit('close')
}

function startEdit(n) {
  editingId.value = n.id
  editName.value = n.name
  editRole.value = n.role
  editService.value = n.service
  editBadge.value = n.badge
}

function cancelEdit() {
  editingId.value = null
}

function saveEdit(n) {
  if (!editName.value.trim()) return
  updateNurse(n.id, {
    name: editName.value,
    role: editRole.value,
    service: editService.value,
    badge: editBadge.value,
  })
  notify(`Infirmier(e) mis à jour : ${editName.value}`)
  editingId.value = null
}

function handleRemove(n) {
  if (nurses.value.length <= 1) {
    notify('Impossible de supprimer le dernier soignant de l\'équipe.')
    return
  }
  if (!confirm(`Supprimer ${n.name} de l'équipe infirmière ?`)) return
  removeNurse(n.id)
  notify(`${n.name} a été retiré(e) de l'équipe.`)
}

function goToProfile() {
  emit('close')
  router.push({ name: 'profile' })
}

function close() {
  emit('close')
}
function stopProp(e) {
  e.stopPropagation()
}
</script>

<template>
  <div class="modal-backdrop" @mousedown="close">
    <div class="modal nurse-switcher-modal" @mousedown="stopProp">
      <header>
        <div>
          <span style="background:var(--primary-soft);color:var(--primary)">
            <AppIcon name="users" />
          </span>
          <div>
            <h2>Prise de poste &amp; Personnel soignant</h2>
            <p>Hôpital · Changement rapide de soignant en service</p>
          </div>
        </div>
        <button type="button" class="icon-btn" @click="close">
          <AppIcon name="x" />
        </button>
      </header>

      <div class="modal-body" style="gap:18px">
        <!-- Soignant actuellement en service -->
        <div class="active-nurse-banner">
          <div class="an-left">
            <AppAvatar :initials="activeNurse.initials" :tone="activeNurse.tone" large />
            <div>
              <div style="display:flex;align-items:center;gap:8px">
                <strong>{{ activeNurse.name }}</strong>
                <span class="badge-status-on">● En service</span>
              </div>
              <small>{{ activeNurse.role }} · {{ activeNurse.service }}</small>
              <div class="an-badge">{{ activeNurse.badge }}</div>
            </div>
          </div>
          <button type="button" class="view-history-btn" @click="goToProfile">
            <AppIcon name="file" :size="14" />
            Voir mes activités
          </button>
        </div>

        <!-- Liste des soignants de l'équipe -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:11px;font-weight:700;color:var(--navy)">
              Équipe infirmière enregistrée ({{ nurses.length }})
            </span>
            <button
              type="button"
              class="add-nurse-toggle-btn"
              @click="showAddForm = !showAddForm"
            >
              <AppIcon :name="showAddForm ? 'x' : 'plus'" :size="13" />
              {{ showAddForm ? 'Fermer' : 'Ajouter un soignant' }}
            </button>
          </div>

          <!-- Barre de recherche infirmier(e) -->
          <div class="nurse-search-wrapper">
            <span class="nurse-search-icon">
              <AppIcon name="search" :size="15" />
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="nurse-search-input"
              placeholder="Rechercher un(e) infirmier(e) par nom, rôle ou service…"
              autocomplete="off"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="nurse-search-clear"
              @click="searchQuery = ''"
              aria-label="Effacer la recherche"
            >
              <AppIcon name="x" :size="13" />
            </button>
          </div>

          <!-- Formulaire d'ajout rapide -->
          <form v-if="showAddForm" class="add-nurse-form" @submit.prevent="handleAddNurse">
            <h4>Enregistrer un(e) nouvel(le) infirmier(e)</h4>
            <div class="grid-2">
              <label class="field">
                <span>Nom complet *</span>
                <input v-model="newName" placeholder="Ex : Sarah Alami" required />
              </label>
              <label class="field">
                <span>Rôle</span>
                <select v-model="newRole">
                  <option>Infirmier(e) DE</option>
                  <option>Infirmier(e) DE (Nuit)</option>
                  <option>Cadre de santé</option>
                  <option>Aide-soignant(e)</option>
                  <option>Médecin prescripteur</option>
                </select>
              </label>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>Service d'affectation</span>
                <input v-model="newService" placeholder="Ex : Médecine 2, Urgences…" />
              </label>
              <label class="field">
                <span>N° de Badge / Matricule</span>
                <input v-model="newBadge" placeholder="Ex : BADGE-055" />
              </label>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px">
              <AppButton variant="secondary" type="button" @click="showAddForm = false">
                Annuler
              </AppButton>
              <AppButton type="submit" icon="check">
                Enregistrer et prendre le poste
              </AppButton>
            </div>
          </form>

          <!-- Liste des cartes de soignants -->
          <div class="nurses-list">
            <!-- Aucun résultat -->
            <div v-if="filteredNurses.length === 0" class="nurse-no-result">
              <AppIcon name="search" :size="20" style="opacity:.35;margin-bottom:6px" />
              <p>Aucun soignant trouvé pour <strong>« {{ searchQuery }} »</strong></p>
            </div>

            <div
              v-for="n in filteredNurses"
              :key="n.id"
              :class="['nurse-card-item', n.id === activeNurse.id ? 'is-active' : '']"
            >
              <!-- Mode Édition -->
              <template v-if="editingId === n.id">
                <div class="nurse-edit-form">
                  <div class="grid-2" style="gap:8px;margin-bottom:8px">
                    <label class="field" style="margin:0">
                      <span style="font-size:10px">Nom *</span>
                      <input v-model="editName" placeholder="Nom complet" />
                    </label>
                    <label class="field" style="margin:0">
                      <span style="font-size:10px">Rôle</span>
                      <select v-model="editRole">
                        <option>Infirmier(e) DE</option>
                        <option>Infirmier(e) DE (Nuit)</option>
                        <option>Cadre de santé</option>
                        <option>Aide-soignant(e)</option>
                        <option>Médecin prescripteur</option>
                      </select>
                    </label>
                    <label class="field" style="margin:0">
                      <span style="font-size:10px">Service</span>
                      <input v-model="editService" placeholder="Service" />
                    </label>
                    <label class="field" style="margin:0">
                      <span style="font-size:10px">Badge</span>
                      <input v-model="editBadge" placeholder="BADGE-000" />
                    </label>
                  </div>
                  <div style="display:flex;gap:6px;justify-content:flex-end">
                    <button type="button" class="btn-cancel-edit" @click="cancelEdit">Annuler</button>
                    <button type="button" class="btn-save-edit" @click="saveEdit(n)">
                      <AppIcon name="check" :size="13" /> Enregistrer
                    </button>
                  </div>
                </div>
              </template>

              <!-- Mode Normal -->
              <template v-else>
                <div class="nci-info" @click="selectNurse(n)" style="cursor:pointer;flex:1">
                  <AppAvatar :initials="n.initials" :tone="n.tone" />
                  <div>
                    <div style="display:flex;align-items:center;gap:6px">
                      <strong>{{ n.name }}</strong>
                      <span v-if="n.id === activeNurse.id" class="badge-active-mini">Actif</span>
                    </div>
                    <small>{{ n.role }} · {{ n.service }}</small>
                  </div>
                </div>
                <div class="nci-actions">
                  <!-- Bouton Prendre le poste ou En poste -->
                  <span v-if="n.id === activeNurse.id" class="in-service-tag">
                    <AppIcon name="check" :size="13" /> En poste
                  </span>
                  <button v-else type="button" class="btn-take-shift" @click="selectNurse(n)">
                    Prendre le poste
                  </button>
                  <!-- Actions Edit / Supprimer -->
                  <button
                    type="button"
                    class="nci-edit-btn"
                    title="Modifier cet infirmier"
                    @click.stop="startEdit(n)"
                  >
                    <AppIcon name="edit" :size="14" />
                  </button>
                  <button
                    type="button"
                    class="nci-remove-btn"
                    title="Retirer cet infirmier de l'équipe"
                    @click.stop="handleRemove(n)"
                  >
                    <AppIcon name="x" :size="14" />
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <span class="nurse-footer-hint">
          <AppIcon name="shield" :size="14" />
          Chaque soin ou traitement administré sera signé au nom du soignant actif.
        </span>
        <AppButton variant="secondary" @click="close">Fermer</AppButton>
      </footer>
    </div>
  </div>
</template>
