<script setup  lang="ts">

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
import { ref, onMounted } from 'vue';
import DialogGroup from './DialogGroup.vue';
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import { Group } from "@/modules/groups/types";
import { useToast } from 'primevue/usetoast'
import { Contact } from '@/modules/contacts/types';




const toast = useToast()
const groupDialog = ref(false);
const isNewGroup = ref(true);

const group = ref(new Group());
const groups = ref(new Array<Group>());
const selectedGroup= ref(new Group());
const deleteGroupDialog = ref(false);
//const contactsByGroupSelected=ref(new Array<Contact>());

const picklistContactValue=ref([new Array<Contact>(),new Array<Contact>()]);

onMounted(async () => {
  await updateDataList();
  //await updateDataPickList();
})


async function updateDataList() {
  const allGroups = await findAllGroup()
  groups.value = allGroups;
}

async function updateDataPickList() {
  const allContacts = await findAll()
  const contactsGroup= await findAllContactsByGroup(selectedGroup.value.id!)
  const privateContacts= allContacts.filter(contact => !contactsGroup.some(groupContact => groupContact.id === contact.id));
  picklistContactValue.value = [privateContacts,contactsGroup];

}

const groupChanged = async () => {
  await updateDataPickList();
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

const saveContactOnGroupe= async() =>{
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

const confirmDeleteGroup = (groupData:Group) => {
    group.value = groupData
    deleteGroupDialog.value = true
}

const deleteGroup = async () => {
  deleteGroupDialog.value = false
  await deleteGroupApi(group.value.id!)
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Conctact Deleted', life: 3000 })
  await updateDataList();
}

const editGroup = (updateGroup:Group) => {
  group.value = updateGroup
  groupDialog.value = true
  isNewGroup.value = false
}


</script>

<template>
    <div class="grid">
    
        <div class="col-12 lg:col-4">
  
            <div class="card">
                <h5>LIST DES GROUPES</h5>
            
                <div class="card flex justify-content-center">
                    <Listbox v-model="selectedGroup" :options="groups" filter optionLabel="name" class="w-full md:w-25rem" @change="groupChanged">
                        <template #option="{ option }">
                            <div class="flex justify-content-between">
                                <div>{{ option.name }}</div>
                                <div>
                                    <!-- Bouton pour modifier le groupe -->
                                    <Button  icon="pi pi-pencil" rounded class="mr-1" @click="editGroup(option)" />
                                    <!-- Bouton pour supprimer le groupe -->
                                    <Button  icon="pi pi-trash"  rounded  severity="danger" @click="confirmDeleteGroup(option); selectedGroup = option" />
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
              
                <h5>Groupe selectioné {{ selectedGroup.name  }}</h5>
                <!-- PickList pour afficher les groupes sélectionnés -->
                <PickList v-model="picklistContactValue" listStyle="height:250px, weight:250px" dataKey="id">
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
                    <Button label="valider" icon="pi pi-times" severity="success" class="mr-2 mt-2 end" @click="saveContactOnGroupe"/>
                    <Button label="Annuler" icon="pi pi-check" severity="danger" @click="cancelAddContact" />
                </div>
            </div>
        </div>
    </div>

    <DialogGroup
      :group="group"
      v-model:visible="groupDialog"
      @valider="updateCreateGroup"
    />

    <DialogConfirmation
      v-model:visible="deleteGroupDialog"
      message="Voulez vous vraiment supprimer ce group ?"
      @confirmation="deleteGroup"
    />

</template>


<style>


</style>