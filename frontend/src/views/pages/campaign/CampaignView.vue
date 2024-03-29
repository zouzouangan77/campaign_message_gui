<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button
            label="New"
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
                placeholder="Search..."
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
            <div class="flex justify-content-center flex-wrap gap-3">
              <SplitButton
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
                v-if="slotProps.data.statut === 'NOT_SENT'"
                icon="pi pi-send"
                label="Envoyer"
                @click="sendCampaign(slotProps.data.id)"
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

    <DialogDetailCampaign :campaignSelected="campaign" v-model:visible="campaignDetailDialog" />

    <DialogConfirmation
      v-model:visible="deleteCampaignDialog"
      message="Voulez vous vraiment supprimer ce Campaign à?"
      @confirmation="deleteCampaign"
    />
    <DialogInfoCampaign
      :campaign="campaign"
      v-model:countdownValue="countdownValue"
      v-model:visible="infoSendCampaignDialog"
      message="Veuillez vous autghentifier"
      
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
const infoSendCampaignDialog= ref(false)
const countdownValue = ref(0); 

const campaign = ref(new Campaign())
const searchField = ref('')
const isNewCampaign = ref(true)
const socket = io()

onMounted(async () => {
  loading.value = true
  await loadLazyData()
  campaign.value.canal = 'WHATS_APP'
  await getAllList()

  // Écoutez les messages du serveur
  socket.on('message', (message) => {
    console.log('nouveau message = ', message)
  })

  socket.on('updateListCampaign', async (message) => {
    //le backend signal au frond de mettre à jour la liste des campagnes
    console.log('updateListCampaign', message)
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
}

const globalSearch = async () => {
  pageable.value.search = searchField.value
  await loadLazyData()
}

const openNewCampaign = () => {
  campaign.value = new Campaign()
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
        summary: 'Successful',
        detail: 'Campaign created',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Campaign not created',
        life: 3000
      })
    }
  } else {
    try {
      await updateCampaignApi(campaign.value.id!, campaign.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Campaign updated',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Campaign not created',
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
const confirmInfoSend = (campaignData: Campaign) => {
  campaign.value = campaignData
  console.log("campain data=  ",campaignData)
  console.log("campain value=  ",campaign.value)
  infoSendCampaignDialog.value = true
  countdownValue.value= 300 //300 secondes (5 minutes)
}


const deleteCampaign = async () => {
  deleteCampaignDialog.value = false
  await deleteCampaignApi(campaign.value.id!)
  selectedCampaigns.value = selectedCampaigns.value.filter((c) => c.id != campaign.value.id)
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Campaign Deleted', life: 3000 })
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
  if (rowData.statut === 'NOT_SENT') {
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
  } else if (rowData.statut === 'SENT') {
    return [
      {
        label: 'Dupliquer',
        icon: 'pi pi-sent',
        command: () => {
          duplicateCampaign(rowData)
        }
      },
      {
        label: 'detail',
        icon: 'pi pi-sent',
        command: () => {
          detailCampaign(rowData)
        }
      }
    ]
  } else {
    return [
      {
        label: 'Detail',
        icon: 'pi pi-sent',
        command: () => {
          //detailCampaign(rowData)
          confirmInfoSend(rowData)
        }
      }
    ]
  }
}

const sendCampaign = (campaignId: number) => {
  socket.emit('sendCampaignMessage', campaignId)
  toast.add({ severity: 'success', summary: 'Envoie', detail: 'Envoie en Cours', life: 3000 })
}
</script>
