<script setup lang="ts">
import { defineProps, defineEmits, defineModel } from 'vue';
import { Contact } from '@/modules/contacts/types';


const props = defineProps<{
  contact: Contact;
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
    header="Contact Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="firstName">First Name</label>
      <InputText
        id="firstName"
        v-model.trim="props.contact.firstName"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !props.contact.firstName }"
      />
      <small class="p-error" v-if="submitted && !props.contact.firstName">First Name is required.</small>
    </div>
    <div class="field">
      <label for="lastName">Last Name</label>
      <InputText id="lastName" v-model="props.contact.lastName" required="true" rows="3" cols="20" />
    </div>
    <div class="field">
      <label for="phoneNumber">Phone Number</label>
      <InputText
        id="phoneNumber"
        v-model="props.contact.phoneNumber"
        required="true"
        rows="3"
        cols="20"
      />
    </div>
    <div class="field">
      <label for="idInsta">Instagram ID</label>
      <InputText id="idInsta" v-model="props.contact.idInsta" required="true" rows="3" cols="20" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="visible = false" />
      <Button label="Save" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
