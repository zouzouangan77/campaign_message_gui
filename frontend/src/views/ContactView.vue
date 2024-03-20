<script setup lang="ts">
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

const handlePageChange = async (/* @ts-ignore */ event: any) => {
  // @ts-ignore
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
</script>

<template>
  <!-- <div v-for="contact in contacts" :key="contact.id">
    <ul>
      <li>id : {{ contact.id }}</li>
      <li>FirstName : {{ contact.firstName }}</li>
      <li>LastName: {{ contact.lastName }}</li>
      <li>Phone : {{ contact.phoneNumber }}</li>
      <li>IdInsta : {{ contact.idInsta }}</li>
    </ul>
    <hr />
  </div> -->

  <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
    <!-- Start coding here -->
    <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
      <div
        class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4"
      >
        <div class="w-full md:w-1/2">
          <div class="flex items-center">
            <label for="simple-search" class="sr-only">Recherche</label>
            <div class="relative w-full">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
                placeholder="Recherche"
              />
            </div>
          </div>
        </div>
        <div
          class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0"
        >
          <button @click="newContact"
            type="button"
            class="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Nouveau Contact
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="bg-primary-50 px-4 py-3">Identifiant</th>
              <th scope="col" class="bg-primary-50 px-4 py-3">Prénom</th>
              <th scope="col" class="bg-primary-50 px-4 py-3">Nom</th>
              <th scope="col" class="bg-primary-50 px-4 py-3">Télélphone</th>
              <th scope="col" class="bg-primary-50 px-4 py-3">Id Insta</th>
              <th scope="col" class="px-4 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="border-b dark:border-gray-700"
              v-for="(contact, index) in contacts"
              :key="contact.id"
              :class="{ 'hover:bg-gray-100': true }"
            >
              <th
                scope="row"
                class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {{ contact.id }}
              </th>
              <td class="px-4 py-3">{{ contact.firstName }}</td>
              <td class="px-4 py-3">{{ contact.lastName }}</td>
              <td class="px-4 py-3">{{ contact.phoneNumber }}</td>
              <td class="px-4 py-3">{{ contact.idInsta }}</td>
              <td class="px-4 py-3 flex items-center justify-end">
                <button
                  @click="showDisplayActions(index)"
                  data-dropdown-toggle="apple-imac-27-dropdown"
                  class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                  type="button"
                >
                  <EllipsisHorizontalIcon class="w-5 h-5" />
                </button>
                <div
                  :class="{ hidden: displayActions != index }"
                  class="absolute z-10 w-44 bg-white rounded right-10 shadow dark:bg-gray-700 dark:divide-gray-600"
                >
                  <ul
                    class="py-1 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="apple-imac-27-dropdown-button"
                  >
                    <li>
                      <a
                        class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >Visualiser</a
                      >
                    </li>
                    <li>
                      <a
                        class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >Modifier</a
                      >
                    </li>
                  </ul>
                  <div class="py-1">
                    <a
                      class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >Supprimer</a
                    >
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginatorItem
        :rows="pageable.limit"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="rowsPerPageOptions"
        @page="handlePageChange"
      />
      <Dialog :open="showDialog" @close="showDialog = false" class="relative z-50">
      <DialogPanel>
        <DialogTitle>
          <div class="text-lg font-semibold">Nouveau Contact</div>
        </DialogTitle>
        <!-- Form Inputs for Contact Details -->
        <div class="space-y-4">
          <div>
            <label for="first-name" class="block font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              id="first-name"
              v-model="currentContact.firstName"
              class="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label for="last-name" class="block font-medium text-gray-700">Nom</label>
            <input
              type="text"
              id="last-name"
              v-model="currentContact.lastName"
              class="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label for="phone" class="block font-medium text-gray-700">Téléphone</label>
            <input
              type="text"
              id="phone"
              v-model="currentContact.phoneNumber"
              class="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label for="insta-id" class="block font-medium text-gray-700">ID Instagram</label>
            <input
              type="text"
              id="insta-id"
              v-model="currentContact.idInsta"
              class="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        </div>
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sauvegarder
        </button>
      </DialogPanel>
    </Dialog>
    </div>

    <!-- Dialog Section -->
    
  </div>
</template>

<style></style>
