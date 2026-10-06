<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import PageTitle from '@/components/common/PageTitle.vue'
import { useFeedback } from '@/composables/useFeedback'

const { feedbacks, totalCount, avgRating } = useFeedback()

const filterCategory = ref('Tous')
const CATEGORIES = ['Tous', 'Bug / Problème', 'Suggestion', 'Amélioration', 'Compliment', 'Autre']

const filtered = computed(() => {
  if (filterCategory.value === 'Tous') return feedbacks.value
  return feedbacks.value.filter(f => f.category === filterCategory.value)
})

const ratingCounts = computed(() => {
  const counts = [0, 0, 0, 0, 0]
  feedbacks.value.forEach(f => { if (f.rating >= 1 && f.rating <= 5) counts[f.rating - 1]++ })
  return counts.reverse() // 5 stars first
})

function categoryClass(cat) {
  if (cat === 'Bug / Problème') return 'badge badge-urgent'
  if (cat === 'Suggestion') return 'badge badge-planifie'
  if (cat === 'Amélioration') return 'badge badge-a-surveiller'
  if (cat === 'Compliment') return 'badge badge-stable'
  return 'badge badge-sortie'
}

function starLabel(stars) {
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}
</script>

<template>
  <div>
    <PageTitle title="Feedbacks utilisateurs" subtitle="Consultez les retours de votre équipe">
      <template #action>
        <span class="badge badge-planifie">{{ totalCount }} feedback(s)</span>
      </template>
    </PageTitle>

    <!-- Stats -->
    <div class="stats-grid" style="margin-bottom:18px">
      <div class="stat-card">
        <div class="stat-icon tone-blue"><AppIcon name="message" /></div>
        <div class="stat-copy">
          <strong>{{ totalCount }}</strong>
          <span>Total feedbacks</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon tone-orange"><AppIcon name="check" /></div>
        <div class="stat-copy">
          <strong>{{ avgRating }}/5</strong>
          <span>Note moyenne</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon tone-red"><AppIcon name="alert" /></div>
        <div class="stat-copy">
          <strong>{{ feedbacks.filter(f => f.category === 'Bug / Problème').length }}</strong>
          <span>Bugs signalés</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon tone-green"><AppIcon name="check" /></div>
        <div class="stat-copy">
          <strong>{{ feedbacks.filter(f => f.category === 'Suggestion' || f.category === 'Amélioration').length }}</strong>
          <span>Suggestions</span>
        </div>
      </div>
    </div>

    <div class="panel">
      <!-- Filtres -->
      <div class="toolbar">
        <div class="filter-tabs">
          <button
            v-for="cat in CATEGORIES"
            :key="cat"
            :class="filterCategory === cat ? 'active' : ''"
            @click="filterCategory = cat"
          >{{ cat }}</button>
        </div>
      </div>

      <!-- Liste feedbacks -->
      <div v-if="filtered.length === 0" class="empty-state">
        <span><AppIcon name="message" /></span>
        <h3>Aucun feedback</h3>
        <p>Les feedbacks de votre équipe apparaîtront ici.</p>
      </div>

      <div v-else class="feedback-admin-list">
        <article v-for="f in filtered" :key="f.id" class="feedback-admin-card">
          <div class="feedback-admin-header">
            <div>
              <div class="feedback-stars">{{ starLabel(f.rating) }}</div>
              <span :class="categoryClass(f.category)">{{ f.category }}</span>
              <span v-if="f.page" class="badge badge-sortie" style="margin-left:4px">{{ f.page }}</span>
            </div>
            <time>{{ f.displayDate }}</time>
          </div>
          <p class="feedback-admin-message">{{ f.message }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
