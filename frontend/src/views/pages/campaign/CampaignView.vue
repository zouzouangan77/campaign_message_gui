<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button
            label="Nouveau"
            icon="pi pi-plus"
            severity="success"
            class="mr-2"
            @click="openNewCampaign"
            raised
          />
        </template>
      </Toolbar>

      <DataTable
        :value="campaigns"
        lazy
        paginator
        :rows="10"
        ref="dt"
        dataKey="id"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        :totalRecords="totalRecords"
        :loading="loading"
        @page="onPage($event)"
        @sort="onSort($event)"
        v-model:selection="selectedCampaigns"
        :tableStyle="{ 'min-width': '75rem' }"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-1">Gestion des Campaignes</h4>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="searchField"
                placeholder="Recherche ..."
                @keydown.enter="globalSearch"
              />
            </IconField>
          </div>
        </template>
        <Column field="name" header="Titre" sortable style="min-width: 8rem"></Column>
        <Column field="canal" header="Canal" sortable style="min-width: 8rem"></Column>
        <Column
          field="createDate"
          header="Date de création"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="updateDate"
          header="Date de Modification"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column field="statut" header="Statut" sortable style="min-width: 4rem">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.statut"
              :severity="getStatusLabel(slotProps.data.statut)"
              raised
            />
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 3rem">
          <template #body="slotProps">
            <div class="flex justify-content-left flex-wrap gap-3">
              <SplitButton
                v-if="slotProps.data.statut === 'NOT_SENT'"
                label="Action"
                icon="pi pi-check"
                severity="secondary"
                menuButtonIcon="pi pi-cog"
                :model="items(slotProps.data)"
              >
                <template #item="option">
                  <span>{{ option.label }}</span>
                </template>
              </SplitButton>

              <Button
                v-if="slotProps.data.statut === 'SENT'"
                icon="pi pi-bars"
                label="Details"
                severity="secondary"
                @click="detailCampaign(slotProps.data)"
              />
              <Button
                v-if="slotProps.data.statut === 'SENT'"
                icon="pi pi-clone"
                label="Dupliquer"
                severity="info"
                @click="duplicateCampaign(slotProps.data)"
              />
              <Button
                v-if="slotProps.data.statut === 'NOT_SENT'"
                icon="pi pi-send"
                label="Envoyer"
                @click="sendCampaign(slotProps.data.id)"
                :disabled="buttonSendDisabled"
              />
              <Button
                v-if="slotProps.data.statut === 'PROCESSING' || slotProps.data.statut === 'PENDING'"
                icon="pi pi-stop-circle"
                severity="danger"
                label="Stop"
                @click="stopCampaign(slotProps.data.id)"
              />
            </div>
            <Toast />
          </template>
        </Column>
      </DataTable>
    </div>
    <DialogCampaign
      v-model:campaign="campaign"
      :messages="messages"
      :groups="groups"
      :attachments="attachments"
      v-model:visible="campaignDialog"
      @valider="updateCreateCampaign"
    />

    <DialogDetailCampaign
      :campaignSelected="campaign"
      v-model:visible="campaignDetailDialog"
      @resend="sendCampaignReject(campaign.id)"
      :disabled="buttonSendDisabled"
    />

    <DialogConfirmation
      v-model:visible="deleteCampaignDialog"
      message="Voulez vous vraiment supprimer ce Campaign à?"
      @confirmation="deleteCampaign"
    />
    <DialogInfoCampaign
      :campaign="campaign"
      v-model:countdownValue="countdownValue"
      v-model:visible="infoSendCampaignDialog"
      message="Veuillez-vous authentifier"
      @valider="confirmSendingCampaign(campaign.id)"
      @cancel="stopCampaign(campaign.id)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  findAllPage,
  findOneCampaign,
  createNewCampaignApi,
  updateCampaignApi,
  deleteCampaignApi
} from '@/modules/campaigns/campaigns.api'
import { findAll } from '@/modules/messages/messages.api'
import { findAllAttachment } from '@/modules/attachments/attachments.api'
import { findAllGroup } from '@/modules/groups/groups.api'

import { Campaign } from '@/modules/campaigns/types'
import type { ICampaign } from '@/modules/campaigns/types'
import { onMounted, ref } from 'vue'
import { Pageable } from '@/modules/shared/types'
import { useToast } from 'primevue/usetoast'
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import DialogCampaign from './DialogCampaign.vue'
import DialogDetailCampaign from './DialogDetailCampaign.vue'
import DialogInfoCampaign from './DialogInfoCampaign.vue'
import { Message } from '@/modules/messages/types'
import { Group } from '@/modules/groups/types'
import { Attachment } from '@/modules/attachments/types'
import type { DataTablePageEvent, DataTableSortEvent } from 'primevue/datatable'
import { io } from 'socket.io-client'

const toast = useToast()
const campaigns = ref(new Array<Campaign>())
const messages = ref(new Array<Message>())
const groups = ref(new Array<Group>())
const attachments = ref(new Array<Attachment>())
const totalRecords = ref(0)
const pageable = ref(new Pageable<ICampaign>())
const dt = ref()
const loading = ref(false)
const selectedCampaigns = ref(new Array<Campaign>())
const campaignDialog = ref(false)
const campaignDetailDialog = ref(false)
const deleteCampaignDialog = ref(false)
const infoSendCampaignDialog = ref(false)
const countdownValue = ref(0)

const campaign = ref(new Campaign())
const searchField = ref('')
const isNewCampaign = ref(true)
const buttonSendDisabled = ref(false)
const socket = io()
const isRejectCampaign = ref(false)

const confirmSendingCampaign = (campaignId: number | undefined) => {
  if (isRejectCampaign.value) {
    console.log('connectionPageOK_SendingRejectMessage')
    socket.emit('connectionPageOK_SendingRejectMessage', campaignId)
  } else {
    console.log('connectionPageOK_SendingMessage')
    socket.emit('connectionPageOK_SendingMessage', campaignId)
  }
}

onMounted(async () => {
  loading.value = true
  await loadLazyData()
  await getAllList()

  socket.on('connectionPage', (campaignData) => {
    campaign.value = campaignData.payload as Campaign
    infoSendCampaignDialog.value = true
    countdownValue.value = 300
  })

  socket.on('cancelSendCampaignMessage', (data) => {
    infoSendCampaignDialog.value = false
  })

  socket.on('errorSendCampaignMessage', (data) => {
    toast.add({
      severity: 'error',
      summary: 'Echec',
      detail: "Erreur durant l'envoie de la campagne",
      life: 3000
    })
  })

  socket.on('updateListCampaign', async (message) => {
    //le backend signal au frond de mettre à jour la liste des campagnes
    await loadLazyData()
  })
})

async function updateDataTable() {
  const query = await findAllPage(pageable.value)
  campaigns.value = query.data
  totalRecords.value = query.meta.totalItems
  loading.value = false
}

async function getAllList() {
  messages.value = await findAll()
  groups.value = await findAllGroup()
  attachments.value = await findAllAttachment()
  attachments.value.unshift({ name: 'Aucune piece jointe' } as Attachment)
}

const globalSearch = async () => {
  pageable.value.search = searchField.value
  await loadLazyData()
}

const openNewCampaign = () => {
  campaign.value = new Campaign()
  campaign.value.canal = 'WHATS_APP'
  campaignDialog.value = true
  isNewCampaign.value = true
}

const editCampaign = async (updateCampaign: Campaign) => {
  campaign.value = await findOneCampaign(updateCampaign.id!)
  campaignDialog.value = true
  isNewCampaign.value = false
}

const duplicateCampaign = async (dcampaign: Campaign) => {
  campaign.value = await findOneCampaign(dcampaign.id!)
  const randomNumber = Math.floor(Math.random() * (10000 - 100 + 1)) + 100
  campaign.value.name += '-' + randomNumber
  campaign.value.id = undefined
  campaign.value.statut = 'NOT_SENT'
  campaignDialog.value = true
  isNewCampaign.value = true
}

const detailCampaign = (updateCampaign: Campaign) => {
  campaign.value = updateCampaign
  campaignDetailDialog.value = true
}

const updateCreateCampaign = async () => {
  if (isNewCampaign.value) {
    try {
      await createNewCampaignApi(campaign.value)
      toast.add({
        severity: 'success',
        summary: 'Réussie',
        detail: 'Campagne créé',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Echec',
        detail: 'Campagne non créé',
        life: 3000
      })
    }
  } else {
    try {
      await updateCampaignApi(campaign.value.id!, campaign.value)
      toast.add({
        severity: 'success',
        summary: 'Réussie',
        detail: 'Campagne mise à jour',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Echec',
        detail: 'Campagne non créé',
        life: 3000
      })
    }
  }
  await loadLazyData()
}

const confirmDeleteCampaign = (campaignData: Campaign) => {
  campaign.value = campaignData
  deleteCampaignDialog.value = true
}

const deleteCampaign = async () => {
  deleteCampaignDialog.value = false
  await deleteCampaignApi(campaign.value.id!)
  selectedCampaigns.value = selectedCampaigns.value.filter((c) => c.id != campaign.value.id)
  toast.add({ severity: 'success', summary: 'Réussie', detail: 'Campagne Supprimé', life: 3000 })
  loadLazyData()
}

const loadLazyData = async () => {
  loading.value = true

  await updateDataTable()
}
const onPage = (event: DataTablePageEvent) => {
  pageable.value.page = event?.page + 1 || pageable.value.page
  pageable.value.limit = event?.rows || pageable.value.limit
  loadLazyData()
}
const onSort = (event: DataTableSortEvent) => {
  if (event?.sortField != undefined && event?.sortField) {
    pageable.value.sortBys = [event?.sortField + (event?.sortOrder === 1 ? ':ASC' : ':DESC')]
  }
  loadLazyData()
}

const getStatusLabel = (status: string): 'success' | 'warning' | 'danger' | 'info' | undefined => {
  switch (status) {
    case 'SENT':
      return 'success'
    case 'PROCESSING':
      return 'warning'
    case 'NOT_SENT':
      return 'danger'
    case 'PENDING':
      return 'info'
    default:
      return undefined
  }
}

const items = (rowData: Campaign) => {
  return [
    {
      label: 'Modifier',
      icon: 'pi pi-refresh',
      command: () => {
        editCampaign(rowData)
      }
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-times',
      command: () => {
        confirmDeleteCampaign(rowData)
      }
    },

    {
      label: 'Dupliquer',
      icon: 'pi pi-sent',
      command: () => {
        duplicateCampaign(rowData)
      }
    }
  ]
}

const sendCampaign = (campaignId: number) => {
  socket.emit('sendCampaignMessage', campaignId)
  isRejectCampaign.value = false
  buttonSendDisabled.value = true

  //on degrise le bouton après 5 seconde, c'est juste pour éviter plusieurs clique à la fois
  setTimeout(() => {
    buttonSendDisabled.value = false
  }, 5000)
}

const sendCampaignReject = (campaignId: number | undefined) => {
  socket.emit('sendCampaignRejectMessage', campaignId)
  isRejectCampaign.value = true
  buttonSendDisabled.value = true

  //on degrise le bouton après 5 seconde, c'est juste pour éviter plusieurs clique à la fois
  setTimeout(() => {
    buttonSendDisabled.value = false
  }, 5000)
}

const stopCampaign = (campaignId: number | undefined) => {
  socket.emit('cancelSendCampaignMessage', campaignId)
  buttonSendDisabled.value = false
}
</script>