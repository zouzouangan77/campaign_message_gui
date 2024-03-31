<template>
  <Dialog v-model:visible="visible" :style="{ width: '50vw', height: '37rem' }" header="Authentification" modal
    @show="startCountdown" :closable="false">

    <div class="grid" style="display: flex; justify-content: center; align-items: center;">

      <div class="mr-3">
        <Card style="width: 20rem;height: 27rem; overflow: hidden">
          <template #header>

            <img v-if="campaign.canal === 'WHATS_APP'" src="/layout/images/whatsapp.png" alt="user header"
              style="width: 20rem;height: 8rem;" />
            <img v-if="campaign.canal === 'INSTAGRAM'" src="/layout/images/instagram.jpg" alt="user header"
              style="width: 16rem;height: 8rem;" />
          </template>
          <template #title><i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: red" />
            Authentification</template>
          <template #content>
            <p class="m-0 b">
              Vous devez vous authentifier afin de poursuivre l'envoi de la campagne
            </p>
            <p class="m-0">
              Vous disposez de 5 min pour cela risque de vous le non envoi de la campagne
            </p>
            <p class="m-0">
              Si vous finissez de vous authentifier Veuillez appuyer sur le bouton <span
                style="font-weight: bold; color: green;">OK</span>
            </p>

          </template>

        </Card>

      </div>

      <div>
        <Knob v-model="countdownValue" :value-template="`${countdownMinutes}:${countdownSeconds}`" :max="300"
          :size="100" />
        <p class="m-0">
          Temps restant : {{ countdownMinutes }} min {{ countdownSeconds }} sec
        </p>
      </div>


    </div>


    <template #footer>
      <Button label="Anuller" icon="pi pi-times" severity="danger" text @click="handleCancel" />
      <Button label="OK" icon="pi pi-check" severity="success" texttext @click="handleSave" />

    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Campaign } from '@/modules/campaigns/types'

defineProps<{
  message: string;
  campaign: Campaign
}>()

const emits = defineEmits<{
  valider: [] // named tuple syntax
  cancel: [] // named tuple syntax
}>()

const countdownValue = defineModel('countdownValue', {
  type: Number,
  default: 0
})


const visible = defineModel('visible', {
  type: Boolean,
  default: false
})

const handleSave = () => {
  emits('valider')
  visible.value = false
}

const handleCancel = () => {
  emits('cancel')
  visible.value = false
}

// Surveillez countdownValue et fermez la boîte de dialogue si la valeur atteint zéro
watch(countdownValue, (newValue) => {
  if (newValue === 0) {
    visible.value = false;
  }
});

let countdownInterval: ReturnType<typeof setInterval> | null = null;

const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  countdownInterval = setInterval(() => {
    if (countdownValue.value >= 0) {
      countdownValue.value -= 1;
    } else {
      if (countdownInterval) clearInterval(countdownInterval);
    }
  }, 1000);
}

const countdownMinutes = computed(() => Math.floor(countdownValue.value / 60));
const countdownSeconds = computed(() => countdownValue.value % 60);
</script>

<style scoped>
/* Styles pour le composant, à adapter selon vos besoins */
.grid {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
