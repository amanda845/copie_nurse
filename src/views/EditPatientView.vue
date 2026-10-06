<script setup>
import { useRouter } from 'vue-router'
import PageTitle from '@/components/common/PageTitle.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import FormSection from '@/components/forms/FormSection.vue'
import AppField from '@/components/forms/AppField.vue'
import AppSelect from '@/components/forms/AppSelect.vue'
import { useNurses } from '@/composables/useNurses'

const router = useRouter()
const emit = defineEmits(['notify'])
const { logActivity } = useNurses()

const edit = true

function submit() {
  logActivity({
    type: 'patient',
    action: 'Dossier patient modifié',
    target: 'Amine Mansouri · DEM-2026-001',
    entity: 'patient',
    entityId: 'DEM-2026-001',
  })
  emit('notify', 'Dossier patient mis à jour')
  router.push({ name: 'patient-record', params: { id: 'DEM-2026-001' } })
}

function deletePatient() {
  emit('notify', 'Suppression annulée — confirmation requise')
}
</script>

<template>
  <div>
    <PageTitle
      title="Modifier le dossier"
      subtitle="Mettez à jour les informations et le suivi d’Amine Mansouri."
    />
    <form class="form-page" @submit.prevent="submit">
      <FormSection
        title="Informations personnelles"
        subtitle="Identité et informations administratives du patient"
        icon="user"
      >
        <AppField label="Nom" placeholder="Nom du patient" modelValue="Mansouri" required />
        <AppField label="Prénom" placeholder="Prénom du patient" modelValue="Amine" required />
        <AppField label="Date de naissance" type="date" modelValue="1999-03-14" required />
        <AppSelect
          label="Sexe"
          :options="['Sélectionner', 'Masculin', 'Féminin']"
          modelValue="Masculin"
        />
        <AppSelect
          label="Groupe sanguin"
          :options="['Sélectionner', 'A+', 'A−', 'B+', 'B−', 'AB+', 'O+', 'O−']"
          modelValue="A+"
        />
        <AppField label="Allergies" placeholder="Aucune allergie connue" modelValue="Pénicilline" />
      </FormSection>
      
      <FormSection
        title="Hospitalisation"
        subtitle="Affectation et état actuel dans le service"
        icon="bed"
      >
        <AppField label="Date d’admission" type="date" modelValue="2026-02-18" required />
        <AppSelect
          label="Chambre"
          :options="['Sélectionner', '12', '14', '15', '16', '18']"
          modelValue="12"
        />
        <AppSelect
          label="Lit"
          :options="['Sélectionner', 'A', 'B']"
          modelValue="A"
        />
        <AppSelect
          label="Service"
          :options="['Service 2 — Médecine', 'Service 1 — Chirurgie']"
        />
        <AppSelect
          label="État actuel"
          :options="['Stable', 'À surveiller', 'Urgent']"
          modelValue="À surveiller"
        />
      </FormSection>

      <FormSection
        title="Informations infirmières"
        subtitle="Éléments nécessaires à la prise en charge quotidienne"
        icon="file"
      >
        <AppSelect
          label="Alimentation"
          :options="['Régime normal', 'Sans sel', 'Diabétique', 'Entérale', 'Parentérale']"
        />
        <AppField label="Perfusion" placeholder="Solution, dose et débit" modelValue="NaCl 0,9% — 500 ml — 40 ml/h" />
        <AppField label="Traitements" placeholder="Traitements en cours" />
        <label class="field field-full">
          <span>Observations</span>
          <textarea placeholder="Ajoutez les informations utiles à l’équipe..." :value="'Patient conscient et coopérant. Surveillance toutes les 2 heures.'" />
        </label>
      </FormSection>

      <div class="danger-zone">
        <div>
          <AppIcon name="alert" />
          <span>
            <strong>Actions sensibles</strong>
            <small>La suppression d’un dossier nécessite une confirmation.</small>
          </span>
        </div>
        <AppButton variant="danger" type="button" @click="deletePatient">
          Supprimer le dossier
        </AppButton>
      </div>

      <div class="form-actions">
        <AppButton variant="secondary" type="button" @click="router.push({ name: 'patient-record', params: { id: 'DEM-2026-001' } })">
          Annuler
        </AppButton>
        <AppButton type="submit" icon="check">
          Enregistrer les modifications
        </AppButton>
      </div>
    </form>
  </div>
</template>
