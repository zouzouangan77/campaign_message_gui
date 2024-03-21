
<template>
    <div>
        <div class="card">
            <Toolbar class="mb-4">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedContacts || !selectedContacts.length" />
                </template>

                <template #end>
                    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                    <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)"  />
                </template>
            </Toolbar>

            <DataTable ref="dt" :value="contacts" v-model:selection="selectedContacts" dataKey="id"
                :paginator="true" :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} contacts">
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
                <Column field="id" header="Id" sortable style="min-width:5rem"></Column>
                <Column field="firstName" header="FirstName" sortable style="min-width:12rem">
                    <template #filter="{filterModel,filterCallback}">
                        <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search"/>
                    </template>
                </Column>
                <Column field="lastName" header="LastName" sortable style="min-width:12rem">
                    <template #filter="{filterModel,filterCallback}">
                        <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search"/>
                    </template>
                </Column>
                <Column field="phoneNumber" header="PhoneNumber" sortable style="min-width:12rem">
                    <template #filter="{filterModel,filterCallback}">
                        <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search"/>
                    </template>
                </Column>
                <Column field="idInsta" header="IdInsta" sortable style="min-width:12rem">
                    <template #filter="{filterModel,filterCallback}">
                        <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search"/>
                    </template>
                </Column>
        
                <Column :exportable="false" style="min-width:8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editcontact(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletecontact(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
        <Dialog v-model:visible="contactDialog" :style="{width: '450px'}" header="Contact  Details" :modal="true" class="p-fluid">
            <div class="field">
                <label for="firstName">FirstName</label>
                <InputText id="firstName" v-model.trim="contact.firstName" required="true" autofocus :class="{'p-invalid': submitted && !contact.firstName}" />
                <small class="p-error" v-if="submitted && !contact.firstName">FirstName is required.</small>
            </div>
            <div class="field">
                <label for="lastName">LastName</label>
                <InputText id="lastName" v-model="contact.lastName" required="true" rows="3" cols="20" />
            </div>
            <div class="field">
                <label for="phoneNumber">Phone Number</label>
                <InputText id="phoneNumber" v-model="contact.phoneNumber" required="true" rows="3" cols="20" />
            </div>
            <div class="field">
                <label for="idInsta">idInsta</label>
                <InputText id="idInsta" v-model="contact.idInsta" required="true" rows="3" cols="20" />
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog"/>
                <Button label="Save" icon="pi pi-check" text @click="saveContact" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteContactDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="contact">Are you sure you want to delete <b>{{contact.lastName}}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteContactDialog = false"/>
                <Button label="Yes" icon="pi pi-check" text @click="deleteContact" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteContactsDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="product">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteContactsDialog = false"/>
                <Button label="Yes" icon="pi pi-check" text />
            </template>
        </Dialog>

        
	</div>
</template>

<script setup lang="ts">

import { findAllPage } from '@/modules/contacts/contacts.api'
import { Contact } from '@/modules/contacts/types'
import type { IContact } from '@/modules/contacts/types'
import { FilterMatchMode } from 'primevue/api';
import { onMounted, ref } from 'vue'
import { Pageable } from '@/modules/shared/types'
import { useToast } from 'primevue/usetoast';


const contacts = ref(new Array<Contact>())
const totalRecords = ref(0)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rowsPerPageOptions = [10, 20, 30]
const pageable = ref(new Pageable<IContact>())


onMounted(async () => {
  await updateDataTable()
})


const dt = ref();
const contactDialog = ref(false);
const deleteContactDialog = ref(false);
const deleteContactsDialog = ref(false);
const contact = ref({});
const selectedContacts = ref();
const filters = ref({
    'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
const submitted = ref(false);


async function updateDataTable() {
  const query = await findAllPage(pageable.value)
  contacts.value = query.data
  totalRecords.value = query.meta.totalItems

  
}
/*onMounted(() => {
    ProductService.getProducts().then((data) => (products.value = data));
});*/



const displayActions = ref(-1)
function showDisplayActions(index: number) {
  if (displayActions.value == index) {
    displayActions.value = -1
  } else {
    displayActions.value = index
  }
}

const openNew = () => {
    contact.value = {};
    submitted.value = false;
    contactDialog.value = true;
};
const hideDialog = () => {
    contactDialog.value = false;
    submitted.value = false;
};

const editContact = (conctact) => {
    contact.value = {...conctact};
    contactDialog.value = true;
};
const confirmDeleteContact = (conctact) => {
    contact.value = conctact;
    deleteContactDialog.value = true;
};
const deleteContact = () => {
    contacts.value = contacts.value.filter(val => val.id !== contact.value.id);
    deleteContactDialog.value = false;
    contact.value = {};
    toast.add({severity:'success', summary: 'Successful', detail: 'Conctact Deleted', life: 3000});
};

const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteContactsDialog.value = true;
};
const deleteselectedContacts = () => {
    contacts.value = contacts.value.filter(val => !selectedContacts.value.includes(val));
    deleteContactsDialog.value = false;
    selectedContacts.value = null;
    toast.add({severity:'success', summary: 'Successful', detail: 'contacts Deleted', life: 3000});
};


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

/*

import { findAllPage } from '@/modules/contacts/contacts.api'
import { Contact } from '@/modules/contacts/types'
import type { IContact } from '@/modules/contacts/types'
import { Pageable } from '@/modules/shared/types'
import { onMounted, ref } from 'vue'
import PaginatorItem from '@/modules/shared/components/PaginatorItem.vue'
import { EllipsisHorizontalIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/16/solid'
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue'

const contacts = ref(new Array<Contact>())
const totalRecords = ref(0)
const rowsPerPageOptions = [10, 20, 30]
const pageable = ref(new Pageable<IContact>())

onMounted(async () => {
  await updateDataTable()
})

const handlePageChange = async ( event: any) => {

  pageable.value.limit = event.rows
  // @ts-ignore
  pageable.value.page = event.page
  await updateDataTable()
}

async function updateDataTable() {
  const query = await findAllPage(pageable.value)
  contacts.value = query.data
  totalRecords.value = query.meta.totalItems
}

const displayActions = ref(-1)
function showDisplayActions(index: number) {
  if (displayActions.value == index) {
    displayActions.value = -1
  } else {
    displayActions.value = index
  }
}

const currentContact =  ref(new Contact())
const showDialog = ref(false)

function newContact(){
  currentContact.value = new Contact()
  showDialog.value = true

  console.log('showDialog.value = ', showDialog.value)
}
*/
</script>

<style>
 

</style>