<script setup lang="ts">

import {

  findAllGroup,
  createNewGroupApi,
  updateGroupApi,
  deleteGroupApi

} from '@/modules/groups/groups.api';

import {
  findAll,
  findAllContactsByGroup

} from '@/modules/contacts/contacts.api'
import { ref, onMounted, computed } from 'vue';
import DialogGroup from './DialogGroup.vue';
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import { Group } from "@/modules/groups/types";
import { useToast } from 'primevue/usetoast'
import { Contact } from '@/modules/contacts/types';
import { PickListMoveAllToSourceEvent, PickListMoveAllToTargetEvent, PickListMoveToSourceEvent, PickListMoveToTargetEvent } from 'primevue/picklist';




const toast = useToast()
const groupDialog = ref(false);
const isNewGroup = ref(true);

const group = ref(new Group());
const groups = ref(new Array<Group>());
const selectedGroup = ref(new Group());
const deleteGroupDialog = ref(false);
const allContacts = ref(new Array<Contact>());
const contactsGroup = ref(new Array<Contact>());
const addContacts = ref(new Array<{ id: number }>());
const removeContacts = ref(new Array<{ id: number }>());

const privateContacts = computed(() => {
  return allContacts.value.filter(contact => !contactsGroup.value.some(groupContact => groupContact.id === contact.id));
});
//const contactsByGroupSelected=ref(new Array<Contact>());

const picklistContactValue = ref([new Array<Contact>(), new Array<Contact>()]);

onMounted(async () => {
  await updateDataList();
  await initDataPickList();
})


async function updateDataList() {
  groups.value = await findAllGroup();
}

async function updateDataPickList() {
  picklistContactValue.value = [privateContacts.value, contactsGroup.value];

}

async function initDataPickList() {
  allContacts.value = await findAll()
}

const groupChanged = async () => {
  contactsGroup.value = await findAllContactsByGroup(selectedGroup.value.id!)
  updateDataPickList()
  addContacts.value=[]
  removeContacts.value=[]
}

const cancelAddContact = async () => {
  await updateDataPickList();
}


const openNewGroup = () => {
  group.value = new Group()
  groupDialog.value = true
  isNewGroup.value = true
};



const updateCreateGroup = async () => {
  if (isNewGroup.value) {
    try {
      await createNewGroupApi(group.value)
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
      await updateGroupApi(group.value.id!, group.value)
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
  await updateDataList();

}

const saveContactOnGroupe = async () => {
  try {
    await updateGroupApi(group.value.id!, group.value)
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

const confirmDeleteGroup = (groupData: Group) => {
  group.value = groupData
  deleteGroupDialog.value = true
}

const deleteGroup = async () => {
  deleteGroupDialog.value = false
  await deleteGroupApi(group.value.id!)
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Conctact Deleted', life: 3000 })
  await updateDataList();
}

const editGroup = (updateGroup: Group) => {
  group.value = updateGroup
  groupDialog.value = true
  isNewGroup.value = false
}


const moveToTaget = (event: PickListMoveToTargetEvent) => {
  event.items.forEach((item: Contact) => {
    addContacts.value.push({ id: item.id })
  });

  contactsGroup.value.forEach((contact: Contact) => {
    addContacts.value = addContacts.value.filter(item => item.id !== contact.id)
  });
  console.log('addContacts = ', addContacts.value)
  console.log('removeContacts = ', removeContacts.value)
}

const moveToSource = (event: PickListMoveToSourceEvent) => {
  event.items.forEach((item: Contact) => {
    removeContacts.value.push({ id: item.id })
  });

  contactsGroup.value.forEach((contact: Contact) => {
    removeContacts.value = removeContacts.value.filter(item => item.id === contact.id)
  });

  console.log('addContacts = ', addContacts.value)
  console.log('removeContacts = ', removeContacts.value)
}

const moveAllToSource = (event: PickListMoveAllToSourceEvent) => {
  event.items.forEach((item: Contact) => {
    removeContacts.value.push({ id: item.id })
  });

  contactsGroup.value.forEach((contact: Contact) => {
    removeContacts.value = addCoremoveContactsntacts.value.filter(item => item.id === contact.id)
  });
  console.log('addContacts = ', addContacts.value)
  console.log('removeContacts = ', removeContacts.value)

}

const moveAllToTarget = (event: PickListMoveAllToTargetEvent) => {
  event.items.forEach((item: Contact) => {
    addContacts.value.push({ id: item.id })
  });

  contactsGroup.value.forEach((contact: Contact) => {
    addContacts.value = addContacts.value.filter(item => item.id !== contact.id)
  });
  console.log('addContacts = ', addContacts.value)
  console.log('removeContacts = ', removeContacts.value)

}

</script>

<template>
  <div class="grid">

    <div class="col-12 lg:col-4">

      <div class="card">
        <h5>LIST DES GROUPES</h5>

        <div class="card flex justify-content-center">
          <Listbox v-model="selectedGroup" :options="groups" filter optionLabel="name" class="w-full md:w-25rem"
            @change="groupChanged">
            <template #option="{ option }">
              <div class="flex justify-content-between">
                <div>{{ option.name }}</div>
                <div>
                  <!-- Bouton pour modifier le groupe -->
                  <Button icon="pi pi-pencil" rounded class="mr-1" @click="editGroup(option)" />
                  <!-- Bouton pour supprimer le groupe -->
                  <Button icon="pi pi-trash" rounded severity="danger"
                    @click="confirmDeleteGroup(option); selectedGroup = option" />
                </div>
              </div>
            </template>
          </Listbox>
        </div>
        <div>
          <Button label="ajouter" icon="pi pi-times" severity="success" class="mr-2 mt-2 end" @click="openNewGroup" />
        </div>



      </div>
    </div>


    <div class="col-12 lg:col-8">

      <div class="card">

        <h5>Groupe selectioné {{ selectedGroup.name }}</h5>
        <!-- PickList pour afficher les groupes sélectionnés -->
        <PickList v-model="picklistContactValue" listStyle="height:250px, weight:250px" dataKey="id"
          @move-to-target="moveToTaget" @move-to-source="moveToSource" @move-all-to-target="moveAllToTarget"
          @move-all-to-source="moveAllToSource">
          <template #sourceheader> contacts </template>
          <template #targetheader> contacts ajoutés </template>
          <template #item="slotProps">
            <div class="flex flex-wrap p-2 align-items-center gap-3">
              <div class="flex-1 flex flex-column gap-2">
                <span class="font-bold">{{ slotProps.item.firstName }}</span>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-tag text-sm"></i>
                  <span>{{ slotProps.item.lastName }}</span>
                </div>
              </div>

            </div>



          </template>
        </PickList>
        <!-- Boutons valider et Annuler -->
        <div>
          <Button label="valider" icon="pi pi-times" severity="success" class="mr-2 mt-2 end"
            @click="saveContactOnGroupe" />
          <Button label="Annuler" icon="pi pi-check" severity="danger" @click="cancelAddContact" />
        </div>
      </div>
    </div>
  </div>

  <DialogGroup :group="group" v-model:visible="groupDialog" @valider="updateCreateGroup" />

  <DialogConfirmation v-model:visible="deleteGroupDialog" message="Voulez vous vraiment supprimer ce group ?"
    @confirmation="deleteGroup" />

</template>


<style></style>