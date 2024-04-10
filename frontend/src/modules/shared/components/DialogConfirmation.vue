<script setup lang="ts">
const visible = defineModel('visible', {
  type: Boolean,
  default: false
})

defineProps<{
  message: string
}>()

defineEmits<{
  confirmation: []
}>()
</script>
<template>
  <Dialog v-model:visible="visible" :style="{ width: '450px' }" header="Confirmation" modal>
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: red" />
      <span>{{ message }}</span>
    </div>
    <template #footer>
      <Button label="Annuler" icon="pi pi-times" severity="danger" text @click="visible = false" />
      <Button
        label="Valider"
        icon="pi pi-check"
        severity="success"
        text
        @click="$emit('confirmation')"
      />
    </template>
  </Dialog>
</template>
