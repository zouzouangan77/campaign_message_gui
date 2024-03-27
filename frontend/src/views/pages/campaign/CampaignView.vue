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
               
                :tableStyle="{'min-width': '75rem'}"
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
                <Column field="name" header="Titre" sortable style="min-width:8rem"></Column>
                <Column field="canal" header="Canal" sortable style="min-width:8rem"></Column>
                <Column field="createDate" header="Date de création" sortable style="min-width:8rem"></Column>
                <Column field="updateDate" header="Date de Modification" sortable style="min-width:8rem"></Column>
                <Column field="statut" header="Statut" sortable style="min-width:4rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.statut" :severity="getStatusLabel(slotProps.data.statut)" raised/>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width:3rem">
                        <template #body="slotProps">
                           
                            <Toast />
                            <SplitButton label="Action" icon="pi pi-check" severity="secondary" menuButtonIcon="pi pi-cog"  :model="items(slotProps.data)" >
                                <template #item="option">
                                    <span>{{ option.label }}</span>
                                </template>
                            
                            </SplitButton>

                            <!--<Button icon="pi pi-pencil" outlined rounded class="mr-0" @click="editCampaign(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCampaign(slotProps.data)" />-->
                         
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
  
        <DialogConfirmation
        v-model:visible="deleteCampaignDialog"
        message="Voulez vous vraiment supprimer ce Campaign ?"
        @confirmation="deleteCampaign"
        />
        
    </div>
  
  </template>
  
  <script setup lang="ts">
  
  import {
  findAllPage,
  findOneCampaign,
  createNewCampaignApi,
  updateCampaignApi,
  deleteCampaignApi,
  
  } from '@/modules/campaigns/campaigns.api'
  import {
 findAll
  } from '@/modules/messages/messages.api'
  import {
  findAllAttachment
  } from '@/modules/attachments/attachments.api'
  import {
   findAllGroup

  } from '@/modules/groups/groups.api'
  
  import { Campaign } from '@/modules/campaigns/types'
  import type { ICampaign } from '@/modules/campaigns/types'
  import { onMounted, ref } from 'vue'
  import { Pageable } from '@/modules/shared/types'
  import { useToast } from 'primevue/usetoast'
  import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
  import DialogCampaign from './DialogCampaign.vue'
  import { Message } from '@/modules/messages/types';
  import { Group } from '@/modules/groups/types';
  import { Attachment } from '@/modules/attachments/types';
  import type { DataTablePageEvent, DataTableSelectAllChangeEvent, DataTableSortEvent } from 'primevue/datatable'
  
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
  const deleteCampaignDialog = ref(false)

  const campaign = ref(new Campaign())
  const searchField = ref('')
  const isNewCampaign = ref(true)
  
  
  onMounted(async () => {
  loading.value = true
  await loadLazyData()
  campaign.value.canal='WHATS_APP'
  await getAllList()
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
   attachments.value= await findAllAttachment()

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
  
  const editCampaign = (updateCampaign: Campaign) => {
  campaign.value = updateCampaign
  campaignDialog.value = true
  isNewCampaign.value = false
  }

  const duplicateCampaign = async (dcampaign: Campaign) => {
    campaign.value = await findOneCampaign(dcampaign.id!)
    const randomNumber= Math.floor(Math.random() * (10000 - 100 + 1)) + 100;
  campaign.value.name+='-'+randomNumber;
  campaign.value.id=undefined;
  campaignDialog.value = true
  isNewCampaign.value = true
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
  
  
  const confirmDeleteCampaign = (campaignData:Campaign) => {
  campaign.value = campaignData
  deleteCampaignDialog.value = true
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
  


  const getStatusLabel = (status: string): 'success' | 'warning' | 'danger' | undefined => {
    switch (status) {
        case 'SENT':
            return 'success';
        case 'PROCESSING':
            return 'warning';
        case 'NOT_SENT':
            return 'danger';
        default:
            return undefined;
    }
};


const items = (rowData:Campaign) => {
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
                label: 'Envoyer',
                icon: 'pi pi-sent',
                command: () => {
                    toast.add({ severity: 'success', summary: 'Updated', detail: 'Envoie en Cours', life: 3000 });
                }
            },
            {
                label: 'Dupliquer',
                icon: 'pi pi-sent',
                command: () => {
                    duplicateCampaign(rowData)
                }
            }
        ];
    } else {
        return [
            {
                label: 'Duplique',
                icon: 'pi pi-sent',
                command: () => {
                    duplicateCampaign(rowData)
                }
            }
        ];
    }
};


const save = () => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Data Saved', life: 3000 });
};
  
  </script>