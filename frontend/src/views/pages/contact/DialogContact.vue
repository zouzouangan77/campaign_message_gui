<script setup lang="ts">
import { ref } from 'vue'
import { Contact } from '@/modules/contacts/types'

const contact = defineModel('contact', {
  type: Contact,
  default: new Contact()
})

const emits = defineEmits<{
  valider: [] // named tuple syntax
}>()

const submitted = ref(false)

const visible = defineModel('visible', {
  type: Boolean,
  default: false
})

const handleSave = () => {
  emits('valider')
  visible.value = false
}
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
      <label for="firstName">Prenom</label>
      <InputText
        id="firstName"
        v-model.trim="contact.firstName"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !contact.firstName }"
      />
      <small class="p-error" v-if="submitted && !contact.firstName">Prenom exigé.</small>
    </div>
    <div class="field">
      <label for="lastName">Nom</label>
      <InputText id="lastName" v-model.trim="contact.lastName" required="true" rows="3" cols="20" />
    </div>
    <div class="field">
      <label for="phoneNumber">Numero de téléphone</label>
      <InputText
        id="phoneNumber"
        v-model.trim="contact.phoneNumber"
        required="true"
        rows="3"
        cols="20"
      />
    </div>
    <div class="field">
      <label for="idInsta">Speudo Instagram </label>
      <InputText id="idInsta" v-model.trim="contact.idInsta" required="true" rows="3" cols="20" />
    </div>

    <template #footer>
      <Button label="Annuler" icon="pi pi-times" text @click="visible = false" />
      <Button label="Enregistrer" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
