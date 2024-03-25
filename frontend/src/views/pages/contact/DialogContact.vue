<script setup lang="ts">
import { ref } from 'vue';
import { Contact } from '@/modules/contacts/types';


const contact = defineModel('contact', {
  type: Contact,
  default: new Contact()
})

const emits = defineEmits(['valider']);

const submitted = ref(false)

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
    :visible="visible"
    :style="{ width: '450px' }"
    header="Contact Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="firstName">First Name</label>
      <InputText
        id="firstName"
        v-model.trim="contact.firstName"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !contact.firstName }"
      />
      <small class="p-error" v-if="submitted && !contact.firstName">First Name is required.</small>
    </div>
    <div class="field">
      <label for="lastName">Last Name</label>
      <InputText id="lastName" v-model="contact.lastName" required="true" rows="3" cols="20" />
    </div>
    <div class="field">
      <label for="phoneNumber">Phone Number</label>
      <InputText
        id="phoneNumber"
        v-model="contact.phoneNumber"
        required="true"
        rows="3"
        cols="20"
      />
    </div>
    <div class="field">
      <label for="idInsta">Instagram ID</label>
      <InputText id="idInsta" v-model="contact.idInsta" required="true" rows="3" cols="20" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="visible = false" />
      <Button label="Save" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
