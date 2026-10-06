import { ref, computed } from 'vue'
import {
  apiCreateTreatment,
  apiDeleteTreatment,
  apiUpdateAdministration,
  apiUpdateTreatment,
} from '@/services/api'

// ── Clé localStorage ────────────────────────────────────────────────────────
const STORAGE_KEY = 'nurseflow_treatments'

// ── Données par défaut ──────────────────────────────────────────────────────
const defaultTreatments = [
  {
    id: 1,
    name: 'Paracétamol',
    dosage: '1 g',
    route: 'IV',
    scheduled: ['08', '12', '16', '20', '00', '04'],
    administrations: {
      '08': { status: 'done', by: 'Salima Msdn', at: '08:02', note: '' },
      '12': { status: 'done', by: 'Salima Msdn', at: '12:05', note: '' },
      '16': { status: 'done', by: 'Salima Msdn', at: '16:07', note: '' },
    },
  },
  {
    id: 2,
    name: 'Amoxicilline',
    dosage: '500 mg',
    route: 'Orale',
    scheduled: ['08', '20'],
    administrations: {
      '08': { status: 'done', by: 'Salima Msdn', at: '08:10', note: '' },
    },
  },
  {
    id: 3,
    name: 'NaCl 0,9%',
    dosage: '500 ml',
    route: 'IV',
    scheduled: ['16', '23'],
    administrations: {
      '16': { status: 'done', by: 'Salima Msdn', at: '16:02', note: '' },
    },
  },
]

// ── State réactif persistant ──────────────────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      parsed.forEach(t => {
        if (t.name && /parac.*tamol/i.test(t.name)) {
          t.name = 'Paracétamol'
        }
      })
      return parsed
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultTreatments))
}

const treatments = ref(loadFromStorage())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(treatments.value))
  } catch (e) {}
}

const ROUTES = ['IV', 'Orale', 'IM', 'SC', 'Sublinguale', 'Topique', 'Inhalée', 'Rectale']
const HOURS_24 = ['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07']
const ADMIN_STATUSES = [
  { value: 'done',      label: 'Administré',    color: 'var(--green)'   },
  { value: 'skipped',   label: 'Reporté',       color: 'var(--orange)'  },
  { value: 'cancelled', label: 'Annulé',        color: 'var(--red)'     },
  { value: 'refused',   label: 'Refus patient', color: '#7c3aed'        },
]

export function useTreatments() {
  function getLastAdministration() {
    let last = null
    let lastTime = ''
    treatments.value.forEach(t => {
      Object.entries(t.administrations || {}).forEach(([hour, admin]) => {
        if (admin && admin.status === 'done' && admin.at > lastTime) {
          lastTime = admin.at
          last = { ...admin, hour, treatmentName: t.name }
        }
      })
    })
    return last
  }

  function addTreatment(data) {
    const id = Math.max(0, ...treatments.value.map(t => t.id)) + 1
    treatments.value.push({
      id,
      name: data.name.trim(),
      dosage: data.dosage.trim(),
      route: data.route,
      scheduled: [...data.scheduled],
      administrations: {},
    })
    persist()
    apiCreateTreatment({
      name: data.name.trim(),
      dosage: data.dosage.trim(),
      route: data.route,
      scheduled: [...data.scheduled],
    }).catch(() => {})
    return id
  }

  function updateTreatment(id, data) {
    const idx = treatments.value.findIndex(t => t.id === id)
    if (idx === -1) return
    treatments.value[idx] = {
      ...treatments.value[idx],
      name: data.name.trim(),
      dosage: data.dosage.trim(),
      route: data.route,
      scheduled: [...data.scheduled],
    }
    persist()
    apiUpdateTreatment(id, {
      name: data.name.trim(),
      dosage: data.dosage.trim(),
      route: data.route,
      scheduled: [...data.scheduled],
    }).catch(() => {})
  }

  function deleteTreatment(id) {
    const idx = treatments.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      treatments.value.splice(idx, 1)
      persist()
      apiDeleteTreatment(id).catch(() => {})
    }
  }

  function toggleAdministration(treatmentId, hour, nurse = 'Salima Msdn') {
    const t = treatments.value.find(t => t.id === treatmentId)
    if (!t) return
    if (!t.administrations) t.administrations = {}
    const existing = t.administrations[hour]
    if (existing && existing.status === 'done') {
      delete t.administrations[hour]
    } else {
      const now = new Date()
      const at = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      t.administrations[hour] = { status: 'done', by: nurse, at, note: '' }
      if (!t.scheduled.includes(hour)) {
        t.scheduled.push(hour)
      }
    }
    persist()
    apiUpdateAdministration(treatmentId, hour, { status: existing?.status === 'done' ? null : 'done', note: '' }).catch(() => {})
  }

  function setAdministrationStatus(treatmentId, hour, status, nurse = 'Salima Msdn', note = '') {
    const t = treatments.value.find(t => t.id === treatmentId)
    if (!t) return
    if (!t.administrations) t.administrations = {}
    if (status === null) {
      delete t.administrations[hour]
    } else {
      const now = new Date()
      const at = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      t.administrations[hour] = { status, by: nurse, at, note }
      if (!t.scheduled.includes(hour)) {
        t.scheduled.push(hour)
      }
    }
    persist()
    apiUpdateAdministration(treatmentId, hour, { status, note }).catch(() => {})
  }

  const upcomingCount = computed(() => {
    const currentHour = String(new Date().getHours()).padStart(2, '0')
    let count = 0
    treatments.value.forEach(t => {
      ;(t.scheduled || []).forEach(h => {
        const admin = t.administrations?.[h]
        if (!admin || (admin.status !== 'done' && admin.status !== 'cancelled')) {
          if (h >= currentHour) count++
        }
      })
    })
    return count
  })

  return {
    treatments,
    ROUTES,
    HOURS_24,
    ADMIN_STATUSES,
    getLastAdministration,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    toggleAdministration,
    setAdministrationStatus,
    upcomingCount,
  }
}
