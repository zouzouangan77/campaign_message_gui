<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch} from 'vue'
import { Campaign } from '@/modules/campaigns/types'
import { Message } from '@/modules/messages/types'
import { Group } from '@/modules/groups/types'
import { Attachment } from '@/modules/attachments/types'

const campaign = defineModel('campaign', {
  type: Campaign,
  default: new Campaign()
})
const attachment = ref(new Attachment())
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

watch(visible, (newValue) => {
  if (newValue) {
    if (campaign.value.attachments && campaign.value.attachments.length > 0) {
      attachment.value = campaign.value.attachments[0] as Attachment
    }
  }
})

const handleSave = () => {
  if (attachment.value.id) {
    campaign.value.attachments = [{ ...attachment.value }]
  } else {
    campaign.value.attachments = []
  }
  emits('valider')
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" :style="{ width: '450px' }" header="Campagne  Details" :modal="true"
    class="p-fluid">
    <div class="field">
      <label for="name">Titre de la campaigne</label>
      <InputText id="name" v-model.trim="campaign.name" required="true" autofocus
        :class="{ 'p-invalid': submitted && !campaign.name }" />
      <small class="p-error" v-if="submitted && !campaign.name">le titre est exigé.</small>
    </div>

    <div class="field">
      <label class="mb-3">Message</label>
      <Dropdown v-model="campaign.message" :options="messages" optionLabel="name"
        placeholder="Selectionné un message" />
    </div>

    <div class="field">
      <label class="mb-3">Groupe</label>

      <MultiSelect v-model="campaign.groups" :options="groups" filter optionLabel="name"
        placeholder="Selectionné les groupes" :maxSelectedLabels="3" />
    </div>

    <div class="field">
      <label class="mb-3">Piece jointe</label>

      <Dropdown v-model="attachment" :options="attachments" filter optionLabel="name"
        placeholder="Selectionné vos pièces jointes" />
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
