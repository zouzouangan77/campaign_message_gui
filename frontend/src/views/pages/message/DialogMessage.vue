<script setup lang="ts">
import { Message } from '@/modules/messages/types'

const visible = defineModel('visible')
defineProps<{
  message: Message
}>()

defineEmits<{
  valider: []
}>()
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
      <label for="name" >Titre du message</label>
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
        <label for="content">Contenue du message</label>
        <Editor v-model="message.content" required="true" editorStyle="height: 250px">
            <template v-slot:toolbar>
                <span class="ql-formats">
                    <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
                    <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
                    <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
                    
                </span>
                <span class="ql-formats">
                    <button v-tooltip.bottom="'ordered'" class="ql-list" value="ordered"></button>
                    <button v-tooltip.bottom="'list'" class="ql-list ql-active "  value="bullet"></button> 
                </span>
            </template>
        </Editor>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="visible=false" />
      <Button label="Save" icon="pi pi-check" text @click="$emit('valider')" />
    </template>
  </Dialog>
</template>
