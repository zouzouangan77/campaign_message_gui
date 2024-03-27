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
              @click="openNewAttachment"
          />
          <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              @click="confirmDeleteSelected"
              :disabled="!selectedAttachments || !selectedAttachments.length"
          />
        </template>
      </Toolbar>

      <DataTable
          :value="attachments"
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
          v-model:selection="selectedAttachments"
          :selectAll="selectAll"
          @select-all-change="onSelectAllChange"
          :tableStyle="{'min-width': '75rem'}"
      >

        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-1">Gestion des Attachment</h4>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText
                  v-model="searchField"
                  placeholder="Search..."
                  @keydown.enter="globalSearch"
              />
            </IconField>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column header="Image">
          <template #body="slotProps">
            <img v-if="slotProps.data.type.trim().startsWith('image')" :src="`/api/attachment/${slotProps.data.id}`"
                 :alt="slotProps.data.id" class="border-round" style="width: 64px"/>
            <InputIcon v-else>
              <i class="pi pi-file" style="font-size: 2rem"/>
            </InputIcon>
          </template>
        </Column>
        <Column field="name" header="Name" sortable style="min-width:8rem"></Column>
        <Column field="filename" header="File name" sortable style="min-width:8rem"></Column>
        <Column field="type" header="Type" sortable style="min-width:8rem"></Column>
        <Column field="createDate" header="Date de création" sortable style="min-width:8rem"></Column>
        <Column field="updateDate" header="Date de Modification" sortable style="min-width:8rem"></Column>
        <Column :exportable="false" style="min-width:3rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-0" @click="editAttachment(slotProps.data)"/>
            <Button icon="pi pi-trash" outlined rounded severity="danger"
                    @click="confirmDeleteAttachment(slotProps.data)"/>
          </template>
        </Column>

      </DataTable>
    </div>
    <DialogAttachment
        :attachment="attachment"
        v-model:inputAttachment="inputAttachment"
        v-model:visible="attachmentDialog"
        @valider="updateCreateAttachment"
    />

    <DialogConfirmation
        v-model:visible="deleteAttachmentDialog"
        message="Voulez vous vraiment supprimer cette pièce jointe ?"
        @confirmation="deleteAttachment"
    />
    <DialogConfirmation
        v-model:visible="deleteAttachmentsDialog"
        message="Voulez vous vraiment supprimer tous vos pièces pointes ?"
        @confirmation="deleteSelectedAttachments"
    />

  </div>

</template>

<script setup lang="ts">

import {
  createNewAttachmentApi,
  deleteAttachmentApi,
  findAll,
  findAllPage,
  updateAttachmentApi
} from '@/modules/attachments/attachments.api'

import {Attachment} from '@/modules/attachments/types'
import type {IAttachment} from '@/modules/attachments/types'
import {onMounted, ref} from 'vue'
import {Pageable} from '@/modules/shared/types'
import {useToast} from 'primevue/usetoast'
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import DialogAttachment from './DialogAttachment.vue'
import type {DataTablePageEvent, DataTableSelectAllChangeEvent, DataTableSortEvent} from 'primevue/datatable'
import {FileUploadUploaderEvent} from "primevue/fileupload";

const toast = useToast()
const attachments = ref(new Array<Attachment>())
const totalRecords = ref(0)
const pageable = ref(new Pageable<IAttachment>())
const dt = ref()
const loading = ref(false)
const selectedAttachments = ref(new Array<Attachment>())
const selectAll = ref(false)
const attachmentDialog = ref(false)
const deleteAttachmentDialog = ref(false)
const deleteAttachmentsDialog = ref(false)
const attachment = ref(new Attachment());
const searchField = ref('')
const isNewAttachment = ref(true)
const inputAttachment = ref()


onMounted(() => {
  loading.value = true
  loadLazyData()
})

async function updateDataTable() {
  const query = await findAllPage(pageable.value)
  attachments.value = query.data
  totalRecords.value = query.meta.totalItems
  loading.value = false
}

const globalSearch = async () => {
  pageable.value.search = searchField.value
  await loadLazyData()
}

const openNewAttachment = () => {
  attachment.value = new Attachment()
  attachmentDialog.value = true
  isNewAttachment.value = true
}

const editAttachment = (updateAttachment: Attachment) => {
  attachment.value = updateAttachment
  attachmentDialog.value = true
  isNewAttachment.value = false
}

const updateCreateAttachment = async () => {
  let formData = new FormData()
  const inputFile = inputAttachment.value
  const file = inputFile.files instanceof Array ? inputFile.files[0] : inputFile.files
  if (file != null && file != undefined) {
    formData.append('file', file)
  }
  formData.append('name', attachment.value.name)
  console.log('formData =', formData)
  if (isNewAttachment.value) {
    try {
      await createNewAttachmentApi(formData)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Attachment created',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Attachment not created',
        life: 3000
      })
    }
  } else {
    try {
      await updateAttachmentApi(attachment.value.id!, formData)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Attachment updated',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Attachment not created',
        life: 3000
      })
    }
  }
  await loadLazyData()
}

const confirmDeleteAttachment = (AttachmentData: Attachment) => {
  attachment.value = AttachmentData
  deleteAttachmentDialog.value = true
}

const deleteAttachment = async () => {
  deleteAttachmentDialog.value = false
  await deleteAttachmentApi(attachment.value.id!)
  selectedAttachments.value = selectedAttachments.value.filter((c) => c.id != attachment.value.id)
  toast.add({severity: 'success', summary: 'Successful', detail: 'Attachment Deleted', life: 3000})
  loadLazyData()
}


const confirmDeleteSelected = () => {
  deleteAttachmentsDialog.value = true
}

const deleteSelectedAttachments = async () => {
  do {
    let cont = selectedAttachments.value.pop() as Attachment
    await deleteAttachmentApi(cont.id!)
  } while (selectedAttachments.value.length > 0)
  deleteAttachmentsDialog.value = false
  selectedAttachments.value = new Array<Attachment>()
  selectAll.value = false
  toast.add({severity: 'success', summary: 'Successful', detail: 'Attachments Deleted', life: 3000})
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
    const allAttachments = await findAll()
    selectAll.value = true
    selectedAttachments.value = allAttachments
  } else {
    selectAll.value = false
    selectedAttachments.value = []
  }
}

</script>