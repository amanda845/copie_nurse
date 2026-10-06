<script setup>
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppLogo from '@/components/common/AppLogo.vue'

const router = useRouter()

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="home-page">
    <div class="home-pattern" aria-hidden="true" />
    <div class="home-glow home-glow-top" aria-hidden="true" />
    <div class="home-glow home-glow-bottom" aria-hidden="true" />

    <header class="home-header">
      <div class="home-container home-header-inner">
        <button class="home-brand" type="button" @click="router.push({ name: 'home' })">
          <AppLogo :size="43" />
          <span class="nurseflow-name">
            <span>Nurse <span class="nurseflow-flow">Flow</span></span>
          </span>
        </button>

        <AppButton class="home-button" @click="goToLogin">
          Se connecter
          <AppIcon name="arrow" :size="16" />
        </AppButton>
      </div>
    </header>

    <main class="home-main">
      <section class="home-container home-hero">
        <div class="home-copy">
          <div class="home-eyebrow">
            <span class="home-status-dot" aria-hidden="true" />
            Gestion numérique des soins
          </div>

          <h1>
            Le suivi des patients,
            <span>pensé pour</span> les équipes infirmières.
          </h1>

          <p>
            Nurse Flow est une solution dédiée à la gestion des soins infirmiers,
            conçue pour simplifier le suivi des patients et améliorer la
            collaboration entre les équipes de soins.
          </p>

          <AppButton class="home-button home-cta" @click="goToLogin">
            Se connecter à l’espace
            <AppIcon name="arrow" :size="18" />
          </AppButton>
        </div>

        <div class="home-illustration" aria-label="Illustration d'un dossier médical">
          <div class="home-illustration-glow" aria-hidden="true" />
          <AppLogo :size="480" />
        </div>
      </section>
    </main>
  </div>
</template>
