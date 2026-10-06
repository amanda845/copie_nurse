import { ref, computed } from 'vue'

const NURSES_STORAGE_KEY = 'nurseflow_hospital_nurses'
const ACTIVE_NURSE_STORAGE_KEY = 'nurseflow_active_nurse_id'
const ACTIVITY_LOG_STORAGE_KEY = 'nurseflow_activity_log'

// ── Équipe infirmière par défaut de l'hôpital ────────────────────────────────
const defaultNurses = [
  {
    id: 'NF-042',
    name: 'Salima Mansouri',
    shortName: 'Salima M.',
    role: 'Infirmière DE',
    service: 'Service Médecine 2',
    initials: 'SM',
    tone: 'blue',
    badge: 'BADGE-042',
  },
  {
    id: 'NF-018',
    name: 'Thomas Dubois',
    shortName: 'Thomas D.',
    role: 'Infirmier DE',
    service: 'Soins continus & Médecine',
    initials: 'TD',
    tone: 'green',
    badge: 'BADGE-018',
  },
  {
    id: 'NF-029',
    name: 'Amina Belkacem',
    shortName: 'Amina B.',
    role: 'Infirmière DE (Nuit)',
    service: 'Service Médecine 2',
    initials: 'AB',
    tone: 'purple',
    badge: 'BADGE-029',
  },
  {
    id: 'NF-035',
    name: 'Karim Benali',
    shortName: 'Karim B.',
    role: 'Infirmier DE',
    service: 'Urgences / Soins intensifs',
    initials: 'KB',
    tone: 'orange',
    badge: 'BADGE-035',
  },
  {
    id: 'NF-007',
    name: 'Julie Martin',
    shortName: 'Julie M.',
    role: 'Cadre de santé',
    service: 'Coordination des soins',
    initials: 'JM',
    tone: 'blue',
    badge: 'BADGE-007',
  },
]

// ── Chargement depuis localStorage ──────────────────────────────────────────
function loadNurses() {
  try {
    const raw = localStorage.getItem(NURSES_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return defaultNurses
}

function loadActiveNurseId() {
  try {
    const raw = localStorage.getItem(ACTIVE_NURSE_STORAGE_KEY)
    if (raw) return raw
  } catch (e) {}
  return 'NF-042' // Salima Mansouri par défaut
}

function loadActivityLog() {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  // Données initiales d'exemple d'activités
  return [
    {
      id: 1,
      nurseId: 'NF-042',
      nurseName: 'Salima Mansouri',
      type: 'treatment',
      action: 'Administration validée',
      target: 'Paracétamol 1 g · IV (16:00)',
      time: '16:07',
      date: 'Aujourd\'hui',
      patient: 'Amine Mansouri',
    },
    {
      id: 2,
      nurseId: 'NF-042',
      nurseName: 'Salima Mansouri',
      type: 'treatment',
      action: 'Administration validée',
      target: 'NaCl 0,9% 500 ml · IV (16:00)',
      time: '16:02',
      date: 'Aujourd\'hui',
      patient: 'Amine Mansouri',
    },
    {
      id: 3,
      nurseId: 'NF-042',
      nurseName: 'Salima Mansouri',
      type: 'treatment',
      action: 'Administration validée',
      target: 'Paracétamol 1 g · IV (12:00)',
      time: '12:05',
      date: 'Aujourd\'hui',
      patient: 'Amine Mansouri',
    },
    {
      id: 4,
      nurseId: 'NF-018',
      nurseName: 'Thomas Dubois',
      type: 'observation',
      action: 'Observation clinique ajoutée',
      target: 'Constantes stables, EVA douleur 2/10',
      time: '10:30',
      date: 'Aujourd\'hui',
      patient: 'Amine Mansouri',
    },
  ]
}

const nurses = ref(loadNurses())
const activeNurseId = ref(loadActiveNurseId())
const activityLog = ref(loadActivityLog())

function persistNurses() {
  try {
    localStorage.setItem(NURSES_STORAGE_KEY, JSON.stringify(nurses.value))
  } catch (e) {}
}

function persistActiveNurse() {
  try {
    localStorage.setItem(ACTIVE_NURSE_STORAGE_KEY, activeNurseId.value)
  } catch (e) {}
}

function persistActivityLog() {
  try {
    localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(activityLog.value))
  } catch (e) {}
}

export function useNurses() {
  const activeNurse = computed(() => {
    return nurses.value.find(n => n.id === activeNurseId.value) || nurses.value[0] || {
      id: 'NF-001',
      name: 'Infirmier de garde',
      shortName: 'Infirmier',
      role: 'IDE',
      service: 'Médecine',
      initials: 'IG',
      tone: 'blue',
      badge: 'NF-001',
    }
  })

  function setActiveNurse(id) {
    const exists = nurses.value.some(n => n.id === id)
    if (exists) {
      activeNurseId.value = id
      persistActiveNurse()
    }
  }

  function addNurse({ name, role = 'Infirmier(e) DE', service = 'Service Médecine', badge = '' }) {
    const cleanName = name.trim()
    const parts = cleanName.split(' ')
    const initials = parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2) || 'ID'
    const shortName = parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase()}.`
      : cleanName
    const tones = ['blue', 'green', 'purple', 'orange']
    const tone = tones[nurses.value.length % tones.length]
    const id = `NF-${String(nurses.value.length + 1).padStart(3, '0')}`

    const newNurse = {
      id,
      name: cleanName,
      shortName,
      role: role.trim() || 'Infirmier(e) DE',
      service: service.trim() || 'Service Médecine',
      initials,
      tone,
      badge: badge.trim() || `BADGE-${id.split('-')[1]}`,
    }

    nurses.value.push(newNurse)
    persistNurses()
    return newNurse
  }

  function removeNurse(id) {
    // Empêcher de supprimer le dernier infirmier
    if (nurses.value.length <= 1) return false
    // Si on supprime l'infirmier actif, basculer vers un autre
    if (activeNurseId.value === id) {
      const other = nurses.value.find(n => n.id !== id)
      if (other) activeNurseId.value = other.id
      persistActiveNurse()
    }
    nurses.value = nurses.value.filter(n => n.id !== id)
    persistNurses()
    return true
  }

  function updateNurse(id, updates) {
    const idx = nurses.value.findIndex(n => n.id === id)
    if (idx === -1) return false
    const current = nurses.value[idx]
    const cleanName = (updates.name || current.name).trim()
    const parts = cleanName.split(' ')
    const initials = parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2) || 'ID'
    const shortName = parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase()}.`
      : cleanName
    nurses.value[idx] = {
      ...current,
      ...updates,
      name: cleanName,
      shortName,
      initials,
    }
    persistNurses()
    return true
  }

  function logActivity({
    nurseId = activeNurse.value.id,
    nurseName = activeNurse.value.name,
    type = 'treatment',
    action = '',
    target = '',
    patient = 'Amine Mansouri',
  }) {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const item = {
      id: Date.now(),
      nurseId,
      nurseName,
      type,
      action,
      target,
      time,
      date: 'Aujourd\'hui',
      patient,
    }
    activityLog.value.unshift(item)
    // Conserver les 100 dernières activités
    if (activityLog.value.length > 100) {
      activityLog.value = activityLog.value.slice(0, 100)
    }
    persistActivityLog()
    return item
  }

  const activeNurseActivities = computed(() => {
    return activityLog.value.filter(a => a.nurseId === activeNurse.value.id)
  })

  function getActivitiesForNurse(id) {
    return activityLog.value.filter(a => a.nurseId === id)
  }

  return {
    nurses,
    activeNurse,
    activeNurseId,
    activityLog,
    activeNurseActivities,
    setActiveNurse,
    addNurse,
    removeNurse,
    updateNurse,
    logActivity,
    getActivitiesForNurse,
  }
}
