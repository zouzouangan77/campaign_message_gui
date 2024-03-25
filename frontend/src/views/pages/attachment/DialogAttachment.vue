<script setup lang="ts">
import { defineEmits, defineModel ,ref} from 'vue';
import { Attachment } from '@/modules/attachments/types';

const attachment = defineModel('Attachment', {
  type: Attachment,
  default: new Attachment()
})
const emits = defineEmits<{
  valider: [] // named tuple syntax
}>()

const submitted = ref(false);

const visible = defineModel('visible', {
  type: Boolean,
  default: false
});


const handleSave = () => {
  emits('valider');
  visible.value = false; 
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    header="Attachment  Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="name">Titre du Attachment</label>
      <InputText
        id="name"
        v-model.trim="attachment.name"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !attachment.name }"
      />
      <small class="p-error" v-if="submitted && !attachment.name">le titre is required.</small>
    </div>

    <div class="field">
      <label for="content">votre fichier </label>
    </div>
    
    <template #footer>
      <Button label="Cancel" severity="danger" icon="pi pi-times" text @click="visible = false" />
      <Button label="Save" severity="success" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
@/modules/groups/attachments/types