<script setup lang="ts">
import { ref } from 'vue'
import { Campaign } from '@/modules/campaigns/types'
import { Message } from '@/modules/messages/types'
import { Group } from '@/modules/groups/types'
import { Attachment } from '@/modules/attachments/types'

const campaign = defineModel('campaign', {
  type: Campaign,
  default: new Campaign()
})
const emits = defineEmits<{
  valider: [] // named tuple syntax
}>()

defineProps<{
  messages: Array<Message>
  groups: Array<Group>
  attachments: Array<Attachment>
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
    header="Campaigne  Details"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="name">Titre de la campaigne</label>
      <InputText
        id="name"
        v-model.trim="campaign.name"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !campaign.name }"
      />
      <small class="p-error" v-if="submitted && !campaign.name">le titre is required.</small>
    </div>

    <div class="field">
      <label class="mb-3">Message</label>
      <Dropdown
        v-model="campaign.message"
        :options="messages"
        optionLabel="name"
        placeholder="Selectionné un message"
      />
    </div>

    <div class="field">
      <label class="mb-3">Groupe</label>

      <MultiSelect
        v-model="campaign.groups"
        :options="groups"
        filter
        optionLabel="name"
        placeholder="Selectionné les groupes"
        :maxSelectedLabels="3"
      />
    </div>

    <div class="field">
      <label class="mb-3">Piece jointe</label>

      <MultiSelect
        v-model="campaign.attachments"
        :options="attachments"
        filter
        optionLabel="name"
        placeholder="Selectionné vos pièces jointes"
        :maxSelectedLabels="3"
      />
    </div>

    <div class="field">
      <label class="mb-3">Canal</label>
      <div class="formgrid grid">
        <div class="field-radiobutton col-6">
          <RadioButton name="canal" value="WHATS_APP" v-model="campaign.canal" />
          <label for="canal1">WhatsApp</label>
        </div>
        <div class="field-radiobutton col-6">
          <RadioButton name="canal" value="INSTAGRAM" v-model="campaign.canal" />
          <label for="canal2">Instagram</label>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" severity="danger" icon="pi pi-times" text @click="visible = false" />
      <Button label="Save" severity="success" icon="pi pi-check" text @click="handleSave" />
    </template>
  </Dialog>
</template>
