<script setup>
import { ref, computed } from 'vue'
import { transmissionData } from '@/modules/transmissions/transmissions.data'
import AppAvatar from '@/components/common/AppAvatar.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppBadge from '@/components/common/AppBadge.vue'

const filter = ref('Toutes')

const visible = computed(() => {
  return transmissionData.filter((t) => {
    if (filter.value === 'Toutes') return true
    if (filter.value === 'Urgentes') return t.priority === 'Urgente'
    return t.read === filter.value
  })
})
</script>

<template>
  <div>
    <section class="panel transmissions-page-header">
      <div class="panel-header">
        <div>
          <h2>Transmissions infirmières</h2>
          <p>Partagez les informations importantes avec l’équipe suivante.</p>
        </div>
        <div class="filter-tabs transmissions-filters">
          <button
            v-for="f in ['Toutes', 'À lire', 'Lues', 'Urgentes']"
            :key="f"
            :class="['filter-chip', `filter-chip-${f.toLowerCase().replace('à lire', 'a-lire')}`, filter === f ? 'active' : '']"
            @click="filter = f"
          >
            {{ f }}
          </button>
        </div>
      </div>
    </section>

    <div class="transmission-cards">
      <article
        v-for="t in visible"
        :key="t.patient + t.time"
        :class="`transmission-card ${t.read === 'À lire' ? 'unread' : ''}`"
      >
        <AppAvatar
          :initials="t.initials"
          :tone="t.priority === 'Urgente' ? 'orange' : 'blue'"
        />
        <div class="transmission-card-main">
          <header>
            <div>
              <strong>{{ t.patient }}</strong>
              <span>
                <AppIcon name="clock" :size="14" />
                {{ t.time }} · par {{ t.nurse }}
              </span>
            </div>
            <div>
              <AppBadge :status="t.priority" />
              <AppBadge :status="t.read" />
            </div>
          </header>
          <p>{{ t.message }}</p>
          <footer>
            <span>Service 2 — Médecine</span>
            <button v-if="t.read === 'À lire'">
              <AppIcon name="check" :size="15" />
              Marquer comme lue
            </button>
          </footer>
        </div>
      </article>
    </div>
  </div>
</template>
