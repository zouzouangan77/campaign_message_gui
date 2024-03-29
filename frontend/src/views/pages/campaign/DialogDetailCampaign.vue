<script setup lang="ts">
import { ref } from 'vue'
import { CampaignSending, CampaignReject } from '@/modules/campaigns/types'
import type { Campaign } from '@/modules/campaigns/types'

import type { DataTablePageEvent, DataTableSortEvent } from 'primevue/datatable'
import { Pageable } from '@/modules/shared/types'

import { findAllSendingPage, findAllRejectPage } from '@/modules/campaigns/campaigns.api'
import type ColorPicker from 'primevue/colorpicker'

const props = defineProps<{
  campaignSelected: Campaign
}>()

const visible = defineModel('visible', {
  type: Boolean,
  default: false
})

const emits = defineEmits<{
  resend: [campaignid: number] // named tuple syntax
}>()

const totalRecordSendings = ref(0)
const totalRecordsRejects = ref(0)
const pageableSending = ref(new Pageable<{ 'campaign.id': number }>())
const pageableReject = ref(new Pageable<{ 'campaign.id': number }>())
const dt = ref()
const loading = ref(false)
const tabActiveIndex= ref(0)
const campaignsSendings = ref(new Array<CampaignSending>())
const campaignRejects = ref(new Array<CampaignReject>())
const searchField = ref('')
async function dataTableList() {
  const querySendings = await findAllSendingPage(pageableSending.value)
  const queryRejects = await findAllRejectPage(pageableReject.value)
  campaignsSendings.value = querySendings.data
  campaignRejects.value = queryRejects.data

  totalRecordSendings.value = querySendings.meta.totalItems
  totalRecordsRejects.value = queryRejects.meta.totalItems
  loading.value = false
}

const globalSearch = async () => {
  pageableSending.value.search = searchField.value
  pageableReject.value.search = searchField.value
  await loadLazyData()
}

const loadLazyData = async () => {
  loading.value = true

  await dataTableList()
}

const showDialog = async () => {
  pageableSending.value.filter = { 'campaign.id': props.campaignSelected.id ?? -1 }
  pageableReject.value.filter = { 'campaign.id': props.campaignSelected.id ?? -1 }
  await loadLazyData()
}

const onPage = (event: DataTablePageEvent, int: number) => {
  if (int === 1) {
    pageableSending.value.page = event?.page + 1 || pageableSending.value.page
    pageableSending.value.limit = event?.rows || pageableSending.value.limit
    loadLazyData()
  } else {
    pageableReject.value.page = event?.page + 1 || pageableReject.value.page
    pageableReject.value.limit = event?.rows || pageableReject.value.limit
    loadLazyData()
  }
}
const onSort = (event: DataTableSortEvent, int: number) => {
  if (event?.sortField != undefined && event?.sortField && int === 1) {
    pageableSending.value.sortBys = [event?.sortField + (event?.sortOrder === 1 ? ':ASC' : ':DESC')]
  } else if (event?.sortField != undefined && event?.sortField && int === 2) {
    pageableReject.value.sortBys = [event?.sortField + (event?.sortOrder === 1 ? ':ASC' : ':DESC')]
  }
  loadLazyData()
}

const handleReSend = () => {
  emits('resend')
  visible.value = false
  tabActiveIndex.value = 0
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '70vw' }"
    header="Campaigne  Details"
    @show="showDialog"
    maximizable
    modal
    :contentStyle="{ height: '300px' }"
  >
    <TabView v-model:active-index="tabActiveIndex">
      <TabPanel header="CAMPAGNES ENVOY&Eacute;ES">
        <DataTable
          :value="campaignsSendings"
          :scrollable="true"
          scrollHeight="flex"
          lazy
          paginator
          :rows="10"
          ref="dt"
          dataKey="id"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          :totalRecords="totalRecordSendings"
          :loading="loading"
          @page="onPage($event, 1)"
          @sort="onSort($event, 1)"
        >
          <template #header>
            <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
              <h4 class="m-1">Recherche sur les messages envoyés</h4>
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
          <Column
            field="contact.lastName"
            header="Nom"
            style="min-width: 200px"
          ></Column>
          <Column
            field="contact.firstName"
            header="Prenom"
            style="min-width: 200px"
          ></Column>
          <Column field="sendingDate" header="Date Envoie" style="min-width: 200px"></Column>
        </DataTable>
      </TabPanel>
      <TabPanel header="CAMPAGNES NON ENVOY&Eacute;ES">
        <DataTable
          :value="campaignRejects"
          :scrollable="true"
          scrollHeight="flex"
          lazy
          paginator
          :rows="10"
          ref="dt"
          dataKey="id"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          :totalRecords="totalRecordsRejects"
          :loading="loading"
          @page="onPage($event, 2)"
          @sort="onSort($event, 2)"
        >
          <template #header>
            <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
              <h4 class="m-1">Recherche sur les messages Non envoyés</h4>
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

          <Column
            field="contact.lastName"
            header="Nom"
            style="min-width: 200px"
          ></Column>
          <Column
            field="contact.firstName"
            header="Prenom"
            style="min-width: 200px"
          ></Column>
          <Column field="rejectDate" header="Date reject" style="min-width: 200px"></Column>
          <Column field="cause" header="cause" style="min-width: 200px"></Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <template #footer>
      <Button label="Quitter" icon="pi pi-check" @click="visible = false; tabActiveIndex = 0" severity="danger"/>
      <Button v-if="tabActiveIndex===1 && campaignRejects.length > 0" label="Re-envoyer" icon="pi pi-send" @click="handleReSend"  />
    </template>
  </Dialog>
</template>
