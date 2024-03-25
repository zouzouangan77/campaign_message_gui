<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts">
import { defineProps, defineEmits, defineModel } from 'vue';
import { Group } from '@/modules/groups/types';


const props = defineProps<{
  group: Group;
}>();
const emits = defineEmits<{
  valider: () => void;
}>();


const visible = defineModel('visible', {
  type: Boolean,
  defaultValue: false
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
    header="Groupe Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="name">titre du groupe</label>
      <InputText
        id="name"
        v-model.trim="props.group.name"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !props.group.name }"
      />
      <small class="p-error" v-if="submitted && !props.group.name"> Name is required.</small>
    </div>

    <div class="field">
            <label for="content">commentaire du groupe</label>
            <!-- Textarea pour saisir le commentaire -->
            <Textarea v-model="props.group.comment" rows="5" cols="30" />
    </div>

    <template #footer>
      <Button label="Cancel"  severity="danger" icon="pi pi-times" text @click="visible = false" />
      <Button label="Save" severity="success" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
  
  
  
  
  
  
  
