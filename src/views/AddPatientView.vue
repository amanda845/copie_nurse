<script setup>
import { useRouter } from 'vue-router'
import PageTitle from '@/components/common/PageTitle.vue'
import AppButton from '@/components/common/AppButton.vue'
import FormSection from '@/components/forms/FormSection.vue'
import AppField from '@/components/forms/AppField.vue'
import AppSelect from '@/components/forms/AppSelect.vue'

const router = useRouter()
const emit = defineEmits(['notify'])


function submit() {
  emit('notify', 'Dossier patient créé avec succès')
  router.push({ name: 'patients' })
}
</script>

<template>
  <div>
    <PageTitle
      title="Ajouter un patient"
      subtitle="Créez un dossier de soins partagé pour le service."
    />
    <form class="form-page" @submit.prevent="submit">
      <FormSection
        title="Informations personnelles"
        subtitle="Identité et informations administratives du patient"
        icon="user"
      >
        <AppField label="Nom" placeholder="Nom du patient" required />
        <AppField label="Prénom" placeholder="Prénom du patient" required />
        <AppField label="Date de naissance" type="date" required />
        <AppSelect
          label="Sexe"
          :options="['Sélectionner', 'Masculin', 'Féminin']"
        />
        <AppSelect
          label="Groupe sanguin"
          :options="['Sélectionner', 'A+', 'A−', 'B+', 'B−', 'AB+', 'O+', 'O−']"
        />
        <AppField label="Allergies" placeholder="Aucune allergie connue" />
      </FormSection>
      
      <FormSection
        title="Hospitalisation"
        subtitle="Affectation et état actuel dans le service"
        icon="bed"
      >
        <AppField label="Date d’admission" type="date" required />
        <AppSelect
          label="Chambre"
          :options="['Sélectionner', '12', '14', '15', '16', '18']"
        />
        <AppSelect
          label="Lit"
          :options="['Sélectionner', 'A', 'B']"
        />
        <AppSelect
          label="Service"
          :options="['Service 2 — Médecine', 'Service 1 — Chirurgie']"
        />
        <AppSelect
          label="État initial"
          :options="['Stable', 'À surveiller', 'Urgent']"
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
        <AppField label="Perfusion" placeholder="Solution, dose et débit" />
        <AppField label="Traitements" placeholder="Traitements en cours" />
        <label class="field field-full">
          <span>Observations initiales</span>
          <textarea placeholder="Ajoutez les informations utiles à l’équipe..." />
        </label>
      </FormSection>

      <div class="form-actions">
        <AppButton variant="secondary" @click="router.push({ name: 'patients' })">
          Annuler
        </AppButton>
        <AppButton type="submit" icon="check">
          Créer le dossier
        </AppButton>
      </div>
    </form>
  </div>
</template>
