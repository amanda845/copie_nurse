import { ref, computed } from 'vue'

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks.value))
}

export function useFeedback() {
  function addFeedback(data) {
    const id = Date.now()
    const now = new Date()
    feedbacks.value.unshift({
      id,
      rating: data.rating,
      category: data.category,
      message: data.message,
      page: data.page || '',
      createdAt: now.toISOString(),
      displayDate: `${now.toLocaleDateString('fr-FR')} à ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
    })
    persist()
    return id
  }

  const totalCount = computed(() => feedbacks.value.length)
  const avgRating = computed(() => {
    if (!feedbacks.value.length) return 0
    return (feedbacks.value.reduce((s, f) => s + f.rating, 0) / feedbacks.value.length).toFixed(1)
  })

  return { feedbacks, addFeedback, totalCount, avgRating }
}
