<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
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
            accept="image/*"
            :maxFileSize="1000000"
            label="Import"
            chooseLabel="Import"
            class="mr-2 inline-block"
          />
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataTable
        :value="contacts"
        lazy
        paginator
        :first="first"
        :rows="10"
        v-model:filters="filters"
        ref="dt"
        dataKey="id"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        :totalRecords="totalRecords"
        :loading="loading"
        @page="onPage($event)"
        @sort="onSort($event)"
        @filter="onFilter($event)"
        filterDisplay="row"
        :globalFilterFields="['firstName', 'lastName', 'phoneNumber', 'idInsta']"
        v-model:selection="selectedContacts"
        :selectAll="selectAll"
        @select-all-change="onSelectAllChange"
        @row-select="onRowSelect"
        @row-unselect="onRowUnselect"
        tableStyle="min-width: 75rem"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-1">Gestion des Contacts</h4>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="firstName" header="FirstName" filterMatchMode="startsWith" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              type="text"
              v-model="filterModel.value"
              @keydown.enter="filterCallback()"
              class="p-column-filter"
              placeholder="Search"
            />
          </template>
        </Column>
        <Column field="lastName" header="LastName" filterMatchMode="startsWith" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              type="text"
              v-model="filterModel.value"
              @keydown.enter="filterCallback()"
              class="p-column-filter"
              placeholder="Search"
            />
          </template>
        </Column>
        <Column field="phoneNumber" header="PhoneNumber" filterMatchMode="startsWith" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              type="text"
              v-model="filterModel.value"
              @keydown.enter="filterCallback()"
              class="p-column-filter"
              placeholder="Search"
            />
          </template>
        </Column>
        <Column field="idInsta" header="IdInsta" filterMatchMode="startsWith" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              type="text"
              v-model="filterModel.value"
              @keydown.enter="filterCallback()"
              class="p-column-filter"
              placeholder="Search"
            />
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 3rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-0"
              @click="editcontact(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeletecontact(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <Dialog
      v-model:visible="contactDialog"
      :style="{ width: '450px' }"
      header="Contact  Details"
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="firstName">FirstName</label>
        <InputText
          id="firstName"
          v-model.trim="contact.firstName"
          required="true"
          autofocus
          :class="{ 'p-invalid': submitted && !contact.firstName }"
        />
        <small class="p-error" v-if="submitted && !contact.firstName">FirstName is required.</small>
      </div>
      <div class="field">
        <label for="lastName">LastName</label>
        <InputText id="lastName" v-model="contact.lastName" required="true" rows="3" cols="20" />
      </div>
      <div class="field">
        <label for="phoneNumber">Phone Number</label>
        <InputText
          id="phoneNumber"
          v-model="contact.phoneNumber"
          required="true"
          rows="3"
          cols="20"
        />
      </div>
      <div class="field">
        <label for="idInsta">idInsta</label>
        <InputText id="idInsta" v-model="contact.idInsta" required="true" rows="3" cols="20" />
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" text @click="saveContact" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteContactDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="contact"
          >Are you sure you want to delete <b>{{ contact.lastName }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteContactDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteContact" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteContactsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="product">Are you sure you want to delete the selected products?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteContactsDialog = false" />
        <Button label="Yes" icon="pi pi-check" text />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { findAllPage } from '@/modules/contacts/contacts.api'
import { Contact } from '@/modules/contacts/types'
import type { IContact } from '@/modules/contacts/types'
import { FilterMatchMode } from 'primevue/api'
import { onMounted, ref } from 'vue'
import { Pageable } from '@/modules/shared/types'
import { useToast } from 'primevue/usetoast'

const contacts = ref(new Array<Contact>())
const totalRecords = ref(0)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rowsPerPageOptions = [10, 20, 30]
const pageable = ref(new Pageable<IContact>())
const dt = ref()
const loading = ref(false)
const selectedContacts = ref()
const selectAll = ref(false)
const first = ref(0)
const contactDialog = ref(false)
const deleteContactDialog = ref(false)
const deleteContactsDialog = ref(false)
const contact = ref({})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  firstName: { value: '', matchMode: 'contains' },
  lastName: { value: '', matchMode: 'contains' },
  phoneNumber: { value: '', matchMode: 'contains' },
  idInsta: { value: '', matchMode: 'contains' }
})
const lazyParams = ref({})
const columns = ref([
  { field: 'firstName', header: 'FirstName' },
  { field: 'lastName', header: 'LastName' },
  { field: 'phoneNumber', header: 'PhoneNumber' },
  { field: 'idInsta', header: 'IdInsta' }
])

onMounted(() => {
  loading.value = true

  lazyParams.value = {
    first: 0,
    rows: 10,
    sortField: null,
    sortOrder: null,
    filters: filters.value
  }

  loadLazyData()
})

async function updateDataTable() {
  const query = await findAllPage(pageable.value)
  contacts.value = query.data
  totalRecords.value = query.meta.totalItems
  loading.value = false
}

const openNew = () => {
  contact.value = {}
  // submitted.value = false;
  contactDialog.value = true
}
const hideDialog = () => {
  contactDialog.value = false
  submitted.value = false
}

const editContact = (conctact) => {
  contact.value = { ...conctact }
  contactDialog.value = true
}
const confirmDeleteContact = (conctact) => {
  contact.value = conctact
  deleteContactDialog.value = true
}
const deleteContact = () => {
  contacts.value = contacts.value.filter((val) => val.id !== contact.value.id)
  deleteContactDialog.value = false
  contact.value = {}
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Conctact Deleted', life: 3000 })
}

const exportCSV = () => {
  dt.value.exportCSV()
}
const confirmDeleteSelected = () => {
  deleteContactsDialog.value = true
}

const deleteselectedContacts = () => {
  contacts.value = contacts.value.filter((val) => !selectedContacts.value.includes(val))
  deleteContactsDialog.value = false
  selectedContacts.value = null
  toast.add({ severity: 'success', summary: 'Successful', detail: 'contacts Deleted', life: 3000 })
}

const loadLazyData = async (event) => {
  loading.value = true

  
  await updateDataTable()
}
const onPage = (event) => {
  loadLazyData(event)
}
const onSort = (event) => {
  console.log('event = ', event)

  lazyParams.value = event
  loadLazyData(event)
}
const onFilter = (event) => {
  lazyParams.value.filters = filters.value
  loadLazyData(event)
}
const onSelectAllChange = (event) => {
  selectAll.value = event.checked

  if (selectAll.value) {
    const query = findAllPage(pageable.value)
    selectAll.value = true
    selectedContacts.value = query.data
  } else {
    selectAll.value = false
    selectedContacts.value = []
  }
}

const onRowSelect = () => {
  selectAll.value = selectedContacts.value.length === totalRecords.value
}
const onRowUnselect = () => {
  selectAll.value = false
}
/*
const saveProduct = () => {
    submitted.value = true;

    if (product.value.name.trim()) {
        if (product.value.id) {
            product.value.inventoryStatus = product.value.inventoryStatus.value ? product.value.inventoryStatus.value : product.value.inventoryStatus;
            products.value[findIndexById(product.value.id)] = product.value;
            toast.add({severity:'success', summary: 'Successful', detail: 'Product Updated', life: 3000});
        }
        else {
            product.value.id = createId();
            product.value.code = createId();
            product.value.image = 'product-placeholder.svg';
            product.value.inventoryStatus = product.value.inventoryStatus ? product.value.inventoryStatus.value : 'INSTOCK';
            products.value.push(product.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Product Created', life: 3000});
        }

        productDialog.value = false;
        product.value = {};
    }
};
*/
</script>
