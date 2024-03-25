<script setup  lang="ts">

import {

  findAllGroup,
  createNewGroupApi,
  updateGroupApi,
  deleteGroupApi
  
} from '@/modules/groups/groups.api';

import {
  findAll,
 
} from '@/modules/contacts/contacts.api'
import { ref, onMounted } from 'vue';
import DialogGroup from './DialogGroup.vue';
import DialogConfirmation from '../../../modules/shared/components/DialogConfirmation.vue'
import { Group } from "@/modules/groups/types";
import { useToast } from 'primevue/usetoast'


const toast = useToast()
const sortOrder = ref(1);
const sortField = ref('');
const sortKey = ref('');
const groupDialog = ref(false);
const isNewGroup = ref(true)

const group = ref(new Group());
const groups = ref(new Array<Group>());
const selectedGroup= ref();
const deleteGroupDialog = ref(false);

const picklistContactValue=ref(null);

onMounted(async () => {
  await updateDataList();
  await updateDataPickList();
})

const picklistValue = ref([
    [
        { name: 'San Francisco', code: 'SF' },
        { name: 'London', code: 'LDN' },
        { name: 'Paris', code: 'PRS' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Berlin', code: 'BRL' },
        { name: 'Barcelona', code: 'BRC' },
        { name: 'Rome', code: 'RM' }
    ],
    []
]);

async function updateDataList() {
  const allGroups = await findAllGroup()
  groups.value = allGroups;
}
async function updateDataPickList() {
  const allContacts = await findAll()
  picklistContactValue.value = [allContacts,[]];
}

const openNewGroup = () => {
    group.value = new Group()
    groupDialog.value = true
    isNewGroup.value = true
};
const hideDialog = () => {
    groupDialog.value = false;
   
};

const onSortChange = (event: MouseEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const sortValue = value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = -1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = 1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
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
      await updateGroupApi(group.value.id, group.value)
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

const confirmDeleteGroup = (groupData:Group) => {
    group.value = groupData
    deleteGroupDialog.value = true
}

const deleteGroup = async () => {
  deleteGroupDialog.value = false
  await deleteGroupApi(group.value.id)
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Conctact Deleted', life: 3000 })
  await updateDataList();
}

const editGroup = (updateGroup) => {
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
                    <Listbox v-model="selectedGroup" :options="groups" filter optionLabel="name" class="w-full md:w-25rem" >
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
                <h5>Groupe selectioné</h5>
                <!-- PickList pour afficher les groupes sélectionnés -->
                <PickList v-model="picklistContactValue" listStyle="height:250px, weight:250px" dataKey="code">
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
                    <Button label="valider" icon="pi pi-times" severity="success" class="mr-2 mt-2 end" @click="deleteContactDialog = false"/>
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
