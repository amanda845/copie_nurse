import { ref, computed } from 'vue'
import { useNurses } from './useNurses'

const STORAGE_KEY = 'nurseflow_feedbacks'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return []
}

const feedbacks = ref(load())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks.value))
  } catch (error) {}
}

export function useFeedback() {
  const { activeNurse, logActivity } = useNurses()

  function addFeedback(data) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const now = new Date()
    feedbacks.value.unshift({
      id,
      nurseId: data.nurseId || activeNurse.value.id,
      nurseName: data.nurseName || activeNurse.value.name,
      rating: data.rating,
      category: data.category,
      message: data.message,
      page: data.page || '',
      createdAt: now.toISOString(),
      status: 'nouveau',
      displayDate: `${now.toLocaleDateString('fr-FR')} à ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
    })
    persist()
    logActivity({
      type: 'feedback',
      action: 'Feedback utilisateur envoyé',
      target: `${data.category} · ${data.rating}/5`,
      entity: 'feedback',
      entityId: id,
      details: { page: data.page || 'Non spécifié' },
    })
    return id
  }

  const totalCount = computed(() => feedbacks.value.length)
  const avgRating = computed(() => {
    if (!feedbacks.value.length) return 0
    return (feedbacks.value.reduce((s, f) => s + f.rating, 0) / feedbacks.value.length).toFixed(1)
  })

  return { feedbacks, addFeedback, totalCount, avgRating }
}
