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
            @click="openNewContact"
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            @click="confirmDeleteSelected"
            :disabled="!selectedContacts || !selectedContacts.length"
          />
        </template>

        <template #end>
          <FileUpload
            mode="basic"
            :maxFileSize="1000000"
            label="Import"
            chooseLabel="Import"
            class="mr-2 inline-block"
            customUpload
            @uploader="uploadFileContact"
            @before-upload="()=>{}"
          />
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV" />
        </template>
      </Toolbar>

      <DataTable
        :value="contacts"
        lazy
        paginator
        :rows="10"
        ref="dt"
        dataKey="id"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        :totalRecords="totalRecords"
        :loading="loading"
        @page="onPage"
        @sort="onSort"
        v-model:selection="selectedContacts"
        :selectAll="selectAll"
        @select-all-change="onSelectAllChange"
        :tableStyle="{'min-width': '75rem'}"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-1">Gestion des Contacts</h4>
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
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="firstName" header="FirstName" sortable></Column>
        <Column field="lastName" header="LastName" sortable></Column>
        <Column field="phoneNumber" header="PhoneNumber" sortable></Column>
        <Column field="idInsta" header="IdInsta" sortable></Column>
        <Column :exportable="false" style="min-width: 3rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editContact(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteContact(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <DialogContact
      :contact="contact"
      v-model:visible="contactDialog"
      @valider="updateCreateContact"
    />

    <DialogConfirmation
      v-model:visible="deleteContactDialog"
      message="Voulez vous vraiment supprimer ce contact ?"
      @confirmation="deleteContact"
    />
    <DialogConfirmation
      v-model:visible="deleteContactsDialog"
      message="Voulez vous vraiment supprimer tous vos contacts ?"
      @confirmation="deleteSelectedContacts"
    />
  </div>
</template>

<script setup lang="ts">
import {
  findAllPage,
  findAll,
  createNewContactApi,
  updateContactApi,
  deleteContactApi,
  importFileContactApi
} from '@/modules/contacts/contacts.api'
import { Contact } from '@/modules/contacts/types'
import type { IContact } from '@/modules/contacts/types'
import { FilterMatchMode } from 'primevue/api'
import { onMounted, ref } from 'vue'
import { Pageable } from '@/modules/shared/types'
import { useToast } from 'primevue/usetoast'
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import DialogContact from './DialogContact.vue'
import type { DataTablePageEvent, DataTableSelectAllChangeEvent, DataTableSortEvent } from 'primevue/datatable'
import type { FileUploadUploaderEvent } from 'primevue/fileupload'

const toast = useToast()
const contacts = ref(new Array<Contact>())
const totalRecords = ref(0)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rowsPerPageOptions = [10, 20, 30]
const pageable = ref(new Pageable<IContact>())
const dt = ref()
const loading = ref(false)
const selectedContacts = ref(new Array<Contact>())
const selectAll = ref(false)
const contactDialog = ref(false)
const deleteContactDialog = ref(false)
const deleteContactsDialog = ref(false)
const contact = ref(new Contact())
const searchField = ref('')
const isNewContact = ref(true)

const filters = ref({
  firstName: { value: '', matchMode: 'contains' },
  lastName: { value: '', matchMode: 'contains' },
  phoneNumber: { value: '', matchMode: 'contains' },
  idInsta: { value: '', matchMode: 'contains' }
})
const columns = ref([
  { field: 'firstName', header: 'FirstName' },
  { field: 'lastName', header: 'LastName' },
  { field: 'phoneNumber', header: 'PhoneNumber' },
  { field: 'idInsta', header: 'IdInsta' }
])

onMounted(() => {
  loading.value = true
  loadLazyData()
})

async function updateDataTable() {
  const query = await findAllPage(pageable.value)
  contacts.value = query.data
  totalRecords.value = query.meta.totalItems
  loading.value = false
}

const globalSearch = async () => {
  pageable.value.search = searchField.value
  await loadLazyData()
}

const openNewContact = () => {
  contact.value = new Contact()
  contactDialog.value = true
  isNewContact.value = true
}

const editContact = (updateContact: Contact) => {
  contact.value = updateContact
  contactDialog.value = true
  isNewContact.value = false
}

const updateCreateContact = async () => {
  if (isNewContact.value) {
    try {
      await createNewContactApi(contact.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Conctact created',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Conctact not created',
        life: 3000
      })
    }
  } else {
    try {
      await updateContactApi(contact.value.id!, contact.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Conctact updated',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Conctact not created',
        life: 3000
      })
    }
  }
  await loadLazyData()
}

const confirmDeleteContact = (contactData: Contact) => {
  contact.value = contactData
  deleteContactDialog.value = true
}

const deleteContact = async () => {
  deleteContactDialog.value = false
  await deleteContactApi(contact.value.id!)
  selectedContacts.value = selectedContacts.value.filter((c) => c.id != contact.value.id)
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Conctact Deleted', life: 3000 })
  loadLazyData()
}

const exportCSV = () => {
  dt.value.exportCSV()
}
const confirmDeleteSelected = () => {
  deleteContactsDialog.value = true
}

const deleteSelectedContacts = async () => {
  do {
    let cont = selectedContacts.value.pop() as Contact
    await deleteContactApi(cont.id!)
  } while (selectedContacts.value.length > 0)
  deleteContactsDialog.value = false
  selectedContacts.value = new Array<Contact>()
  selectAll.value = false
  toast.add({ severity: 'success', summary: 'Successful', detail: 'contacts Deleted', life: 3000 })
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

const onSelectAllChange = async (event : DataTableSelectAllChangeEvent) => {
  selectAll.value = event.checked

  if (selectAll.value) {
    const allContacts = await findAll()
    selectAll.value = true
    selectedContacts.value = allContacts
  } else {
    selectAll.value = false
    selectedContacts.value = []
  }
}

const uploadFileContact = async (event: FileUploadUploaderEvent) => {
  const file = event.files instanceof Array?event.files[0]:event.files
  let formData = new FormData()
  formData.append('file', file) // inputFile est l'élément input de type file

  try {
    await importFileContactApi(formData)
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'File uploaded, contact has been created',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Faillure',
      detail: 'Error during uploading file',
      life: 3000
    })
  }
  await loadLazyData()
}
</script>
