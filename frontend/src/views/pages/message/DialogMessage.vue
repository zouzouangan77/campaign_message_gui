<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@/modules/messages/types'

const message = defineModel('message', {
  type: Message,
  default: new Message()
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
    header="Message  Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="name">Titre du message</label>
      <InputText
        id="name"
        v-model.trim="message.name"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !message.name }"
      />
      <small class="p-error" v-if="submitted && !message.name">le titre is required.</small>
    </div>

    <div class="field">
      <label for="content">Contenu du message</label>
      <Textarea v-model="message.content" style="resize: none;" rows="10" cols="30" />
    </div>

    <template #footer>
      <Button label="Cancel" severity="danger" icon="pi pi-times" text @click="visible = false" />
      <Button label="Save" severity="success" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
