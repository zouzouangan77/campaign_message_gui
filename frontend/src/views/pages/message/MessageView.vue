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
            @click="openNewMessage"
          />
          <Button
            label="Supprimer"
            icon="pi pi-trash"
            severity="danger"
            @click="confirmDeleteSelected"
            :disabled="!selectedMessages || !selectedMessages.length"
          />
        </template>
      </Toolbar>

      <DataTable
        :value="messages"
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
        v-model:selection="selectedMessages"
        :selectAll="selectAll"
        @select-all-change="onSelectAllChange"
        :tableStyle="{ 'min-width': '75rem' }"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-1">Gestion des Messages</h4>
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

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Titre du message" sortable style="min-width: 8rem"></Column>
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
        <Column :exportable="false" style="min-width: 3rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-0"
              @click="editMessage(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteMessage(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <DialogMessage
      :message="message"
      v-model:visible="messageDialog"
      @valider="updateCreateMessage"
    />

    <DialogConfirmation
      v-model:visible="deleteMessageDialog"
      message="Voulez vous vraiment supprimer ce message ?"
      @confirmation="deleteMessage"
    />
    <DialogConfirmation
      v-model:visible="deleteMessagesDialog"
      message="Voulez vous vraiment supprimer tous vos messages ?"
      @confirmation="deleteSelectedMessages"
    />
  </div>
</template>

<script setup lang="ts">
import {
  findAllPage,
  findAll,
  createNewMessageApi,
  updateMessageApi,
  deleteMessageApi
} from '@/modules/messages/messages.api'

import { Message } from '@/modules/messages/types'
import type { IMessage } from '@/modules/messages/types'
import { onMounted, ref } from 'vue'
import { Pageable } from '@/modules/shared/types'
import { useToast } from 'primevue/usetoast'
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import DialogMessage from './DialogMessage.vue'
import type {
  DataTablePageEvent,
  DataTableSelectAllChangeEvent,
  DataTableSortEvent
} from 'primevue/datatable'

const toast = useToast()
const messages = ref(new Array<Message>())
const totalRecords = ref(0)
const pageable = ref(new Pageable<IMessage>())
const dt = ref()
const loading = ref(false)
const selectedMessages = ref(new Array<Message>())
const selectAll = ref(false)
const messageDialog = ref(false)
const deleteMessageDialog = ref(false)
const deleteMessagesDialog = ref(false)
const message = ref(new Message())
const searchField = ref('')
const isNewMessage = ref(true)

onMounted(() => {
  loading.value = true
  loadLazyData()
})

async function updateDataTable() {
  const query = await findAllPage(pageable.value)
  messages.value = query.data
  totalRecords.value = query.meta.totalItems
  loading.value = false
}

const globalSearch = async () => {
  pageable.value.search = searchField.value
  await loadLazyData()
}

const openNewMessage = () => {
  message.value = new Message()
  messageDialog.value = true
  isNewMessage.value = true
}

const editMessage = (updateMessage: Message) => {
  message.value = updateMessage
  messageDialog.value = true
  isNewMessage.value = false
}

const updateCreateMessage = async () => {
  if (isNewMessage.value) {
    try {
      await createNewMessageApi(message.value)
      toast.add({
        severity: 'success',
        summary: 'Réussie',
        detail: 'Message créé',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Echec',
        detail: 'Message non créé',
        life: 3000
      })
    }
  } else {
    try {
      await updateMessageApi(message.value.id!, message.value)
      toast.add({
        severity: 'success',
        summary: 'Réussie',
        detail: 'Message mis à jour',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Echec',
        detail: 'Message non mis à jour',
        life: 3000
      })
    }
  }
  await loadLazyData()
}

const confirmDeleteMessage = (messageData: Message) => {
  message.value = messageData
  deleteMessageDialog.value = true
}

const deleteMessage = async () => {
  deleteMessageDialog.value = false
  await deleteMessageApi(message.value.id!)
  selectedMessages.value = selectedMessages.value.filter((c) => c.id != message.value.id)
  toast.add({ severity: 'success', summary: 'Réussie', detail: 'Message Supprimer', life: 3000 })
  loadLazyData()
}

const confirmDeleteSelected = () => {
  deleteMessagesDialog.value = true
}

const deleteSelectedMessages = async () => {
  do {
    let cont = selectedMessages.value.pop() as Message
    await deleteMessageApi(cont.id!)
  } while (selectedMessages.value.length > 0)
  deleteMessagesDialog.value = false
  selectedMessages.value = new Array<Message>()
  selectAll.value = false
  toast.add({ severity: 'success', summary: 'Réussie', detail: 'Messages Supprimer', life: 3000 })
  await loadLazyData()
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

const onSelectAllChange = async (event: DataTableSelectAllChangeEvent) => {
  selectAll.value = event.checked

  if (selectAll.value) {
    const allMessages = await findAll()
    selectAll.value = true
    selectedMessages.value = allMessages
  } else {
    selectAll.value = false
    selectedMessages.value = []
  }
}
</script>
