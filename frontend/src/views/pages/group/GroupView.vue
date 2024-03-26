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
import {ref, onMounted, computed} from 'vue';
import DialogGroup from './DialogGroup.vue';
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import {Group} from "@/modules/groups/types";
import {useToast} from 'primevue/usetoast'
import {Contact} from '@/modules/contacts/types';
import type {ListboxChangeEvent} from "primevue/listbox";


const toast = useToast()
const visibleGroupDialog = ref(false);
const isNewGroup = ref(true);

const group = ref(new Group());
const groups = ref(new Array<Group>());
const selectedGroup = ref(new Group());
const visibleConfirmDeleteGroupDialog = ref(false);
const allContacts = ref(new Array<Contact>());
const contactsGroup = ref(new Array<Contact>());

const privateContacts = computed(() => {
  return allContacts.value.filter(contact => !contactsGroup.value.some(groupContact => groupContact.id === contact.id));
});

const picklistContacts = ref([new Array<Contact>(), new Array<Contact>()]);
const canBeValidateOrCancel = computed(() => {
  const [sourceContacts, targetContacts] = picklistContacts.value
  return targetContacts.every(targetContact => contactsGroup.value.some((contact) => contact.id === targetContact.id))

})
onMounted(async () => {
  await updateDataList();
  await initDataPickList();
})


async function updateDataList() {
  groups.value = await findAllGroup();
}

async function updateDataPickList() {
  picklistContacts.value = [privateContacts.value, contactsGroup.value];

}

async function initDataPickList() {
  allContacts.value = await findAll()
}

const groupChanged = async () => {

  if (selectedGroup != null && selectedGroup != undefined && selectedGroup.value != null && selectedGroup.value != undefined) {
    contactsGroup.value = await findAllContactsByGroup(selectedGroup.value.id!)
    updateDataPickList()
  }

}

const cancelAddContact = async () => {
  await updateDataPickList();
}


const openNewGroup = () => {
  group.value = new Group()
  visibleGroupDialog.value = true
  isNewGroup.value = true
};


const updateCreateGroup = async () => {
  if (isNewGroup.value) {
    try {
      await createNewGroupApi(group.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Group created',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Group not created',
        life: 3000
      })
    }
  } else {
    try {
      await updateGroupApi(group.value.id!, group.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Group updated',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Faillure',
        detail: 'Group not created',
        life: 3000
      })
    }
  }
  await updateDataList();

}

const saveContactOnGroupe = async () => {
  const [sourceContacts, targetContacts] = picklistContacts.value
  const addContacts = targetContacts.filter((contact) => !contactsGroup.value.some(groupContact => groupContact.id === contact.id)).map(item => ({id: item.id}))
  const removeContacts = contactsGroup.value.filter((contact) => sourceContacts.some(sourceContact => sourceContact.id === contact.id)).map(item => ({id: item.id}))
  group.value = selectedGroup.value
  group.value.addContacts = addContacts
  group.value.removeContacts = removeContacts

  try {
    await updateGroupApi(group.value.id!, group.value)
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Group updated',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Faillure',
      detail: 'Group not updated',
      life: 3000
    })
  }

}

const confirmDeleteGroup = (groupData: Group) => {
  group.value = groupData
  visibleConfirmDeleteGroupDialog.value = true
}

const deleteGroup = async () => {
  visibleConfirmDeleteGroupDialog.value = false
  await deleteGroupApi(group.value.id!)
  toast.add({severity: 'success', summary: 'Successful', detail: 'Group Deleted', life: 3000})
  await updateDataList();
}

const editGroup = (updateGroup: Group) => {
  group.value = updateGroup
  visibleGroupDialog.value = true
  isNewGroup.value = false
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
            <template #option="slotProps">
              <div class="flex justify-content-between">
                <div>{{ slotProps.option.name }}</div>
                <div>
                  <!-- Bouton pour modifier le groupe -->
                  <Button icon="pi pi-pencil" rounded class="mr-1" @click="editGroup(slotProps.option)"/>
                  <!-- Bouton pour supprimer le groupe -->
                  <Button icon="pi pi-trash" rounded severity="danger"
                          @click="confirmDeleteGroup(slotProps.option)"/>
                </div>
              </div>
            </template>
          </Listbox>
        </div>
        <div>
          <Button label="ajouter" icon="pi pi-times" severity="success" class="mr-2 mt-2 end" @click="openNewGroup"/>
        </div>


      </div>
    </div>


    <div class="col-12 lg:col-8">

      <div class="card">

        <h5 v-if="!selectedGroup">Aucun groupe selectionné</h5>
        <h5 v-else>Groupe selectioné {{ selectedGroup.name }}</h5>
        <!-- PickList pour afficher les groupes sélectionnés -->
        <PickList v-model="picklistContacts" listStyle="height:250px, weight:250px" dataKey="id">
          <template #sourceheader> contacts</template>
          <template #targetheader> contacts ajoutés</template>
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
                  :disabled="canBeValidateOrCancel"
                  @click="saveContactOnGroupe"/>
          <Button label="Annuler" icon="pi pi-check" severity="danger" @click="cancelAddContact"
                  :disabled="canBeValidateOrCancel"/>
        </div>
      </div>
    </div>
  </div>

  <DialogGroup v-model:group="group" v-model:visible="visibleGroupDialog" @valider="updateCreateGroup"/>

  <DialogConfirmation v-model:visible="visibleConfirmDeleteGroupDialog"
                      message="Voulez vous vraiment supprimer ce group ?"
                      @confirmation="deleteGroup"/>

</template>


<style></style>