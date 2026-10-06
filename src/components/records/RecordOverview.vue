<script setup>
import AppIcon from '@/components/common/AppIcon.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import InfoRow from './InfoRow.vue'
import TreatmentTimeline from './TreatmentTimeline.vue'
import Observations from './Observations.vue'
</script>

<template>
  <div class="record-layout">
    <div class="record-left">
      <section class="panel info-panel">
        <div class="panel-header">
          <div>
            <h2>Informations patient</h2>
            <p>Identité et informations d'hospitalisation</p>
          </div>
          <span class="section-icon">
            <AppIcon name="user" />
          </span>
        </div>
        <div class="info-grid">
          <InfoRow label="Nom complet" value="Amine Mansouri" />
          <InfoRow label="Date de naissance" value="14 mars 1999" />
          <InfoRow label="Âge" value="27 ans" />
          <InfoRow label="Sexe" value="Masculin" />
          <InfoRow label="Groupe sanguin" value="A+" />
          <InfoRow label="Allergies" value="Pénicilline" :emphasis="true" />
          <InfoRow label="Chambre / Lit" value="12 / A" />
          <InfoRow label="Admission" value="18 févr. 2026 — 14:30" />
        </div>
      </section>
      <section class="panel">
        <TreatmentTimeline :compact="false" :editable="true" />
      </section>
      <Observations />
    </div>
    <div class="record-right">
      <section class="panel summary-card">
        <div class="panel-header">
          <h2>Résumé infirmier</h2>
          <span class="section-icon blue">
            <AppIcon name="file" />
          </span>
        </div>
        <div class="summary-block">
          <div class="summary-label">
            <span class="summary-icon food">
              <AppIcon name="check" />
            </span>
            <div>
              <small>ALIMENTATION</small>
              <strong>Régime normal</strong>
            </div>
          </div>
          <p>Voie orale · Sans restriction</p>
          <small>Surveillance de l'hydratation</small>
        </div>
        <div class="summary-block">
          <div class="summary-label">
            <span class="summary-icon infusion">
              <AppIcon name="pill" />
            </span>
            <div>
              <small>PERFUSION</small>
              <strong>NaCl 0,9% — 500 ml</strong>
            </div>
          </div>
          <p>IV · 40 ml/h · Début 16:00</p>
          <div class="progress"><i /></div>
          <small>En cours · Salima Msdn</small>
        </div>
      </section>
      <section class="panel quick-info">
        <h2>Surveillance actuelle</h2>
        <div>
          <span><AppIcon name="clock" /></span>
          <p>
            <strong>Prochain contrôle</strong>
            <small>Aujourd'hui à 20:00</small>
          </p>
        </div>
        <div>
          <span><AppIcon name="pill" /></span>
          <p>
            <strong>Prochain traitement</strong>
            <small>Paracétamol · 20:00</small>
          </p>
        </div>
        <div>
          <span><AppIcon name="message" /></span>
          <p>
            <strong>Transmission non lue</strong>
            <small>1 information à consulter</small>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
