<script setup lang="ts">
import { Contact } from '@/modules/contacts/types'

const visible = defineModel('visible')
defineProps<{
  contact: Contact
}>()

defineEmits<{
  valider: []
}>()
</script>
<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    header="Contact  Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="firstName">FirstName</label>
      <InputText
        id="firstName"
        v-model.trim="contact.firstName"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !contact.firstName }"
      />
      <small class="p-error" v-if="submitted && !contact.firstName">FirstName is required.</small>
    </div>
    <div class="field">
      <label for="lastName">LastName</label>
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
      <label for="idInsta">idInsta</label>
      <InputText id="idInsta" v-model="contact.idInsta" required="true" rows="3" cols="20" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="visible=false" />
      <Button label="Save" icon="pi pi-check" text @click="$emit('valider')" />
    </template>
  </Dialog>
</template>
