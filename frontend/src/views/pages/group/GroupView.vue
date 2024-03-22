<script setup  lang="ts">
import { ref, onMounted } from 'vue';

const sortOrder = ref(1);
const sortField = ref('');
const sortKey = ref('');
const goupDialog = ref(false);
const mavalue = ref('');

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
const openNew = () => {
    goupDialog.value = true;
};
const hideDialog = () => {
    goupDialog.value = false;
   
};

const selectedCity = ref();
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);

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


</script>

<template>
    <div class="grid">
        <!-- Colonne pour la liste des groupes -->
        <div class="col-12 lg:col-4">
            <!-- Card pour la liste des groupes -->
            <div class="card">
                <h5>LIST DES GROUPES</h5>
                <!-- Listbox pour afficher les groupes -->
                <div class="card flex justify-content-center">
                    <Listbox v-model="selectedCity" :options="cities" filter optionLabel="name" class="w-full md:w-14rem" />
                </div>
                <!-- Boutons Ajouter et supprimer -->
                <div>
                    <Button label="Ajouter" icon="pi pi-times" severity="success" class="mr-2 mt-2 end" @click="openNew"/>
                    <Button label="supprimer" icon="pi pi-check" severity="danger" @click="deleteContact" />
                </div>
            </div>
        </div>
        
        <!-- Colonne pour le picklist -->
        <div class="col-12 lg:col-8">
            <!-- Card pour le picklist -->
            <div class="card">
                <h5>Groupe selectioné</h5>
                <!-- PickList pour afficher les groupes sélectionnés -->
                <PickList v-model="picklistValue" listStyle="height:250px" dataKey="code">
                    <template #sourceheader> contacts </template>
                    <template #targetheader> contacts ajoutés </template>
                    <template #item="slotProps">
                        <div>{{ slotProps.item.name }}</div>
                    </template>
                </PickList>
                <!-- Boutons valider et Annuler -->
                <div>
                    <Button label="valider" icon="pi pi-times" severity="success" class="mr-2 mt-2 end" @click="deleteContactDialog = false"/>
                    <Button label="Annuler" icon="pi pi-check" severity="danger" @click="deleteContact" />
                </div>
            </div>
        </div>
    </div>

    <!-- Dialog pour ajouter un nouveau groupe -->
    <Dialog v-model:visible="goupDialog" :style="{width: '450px'}" header="Groupe  Details" :modal="true" class="p-fluid">
        <!-- Champ pour le titre du groupe -->
        <div class="field">
            <label for="name">Titre du groupe</label>
            <InputText type="text" v-model="mavalue" />
            <!-- Message d'erreur s'il n'y a pas de valeur saisie -->
            <small class="p-error" v-if="submitted && !contact.firstName">FirstName is required.</small>
        </div>
  
        <!-- Champ pour le commentaire du groupe -->
        <div class="field">
            <label for="content">commentaire du groupe</label>
            <!-- Textarea pour saisir le commentaire -->
            <Textarea v-model="mavalue" rows="5" cols="30" />
        </div>
     
        <!-- Boutons Cancel et Save -->
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog"/>
            <Button label="Save" icon="pi pi-check" text @click="saveContact" />
        </template>
    </Dialog>
</template>
