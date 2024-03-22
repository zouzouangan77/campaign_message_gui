<script setup  lang="ts">
import { ref, onMounted } from 'vue';

const sortOrder = ref(1);
const sortField = ref('');
const sortKey = ref('');

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

const orderlistValue = ref([
    { name: 'San Francisco', code: 'SF' },
    { name: 'London', code: 'LDN' },
    { name: 'Paris', code: 'PRS' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Berlin', code: 'BRL' },
    { name: 'Barcelona', code: 'BRC' },
    { name: 'Rome', code: 'RM' }
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
        
        <div class="col-12 lg:col-8">
            <div class="card">
                <h5>Groupe selectioné</h5>
                <PickList v-model="picklistValue" listStyle="height:250px" dataKey="code">
                    <template #sourceheader> contacts </template>
                    <template #targetheader> contacts ajoutés </template>
                    <template #item="slotProps">
                        <div>{{ slotProps.item.name }}</div>
                    </template>
                </PickList>
            </div>
        </div>

        <div class="col-12 lg:col-4">
            <div class="card">
                <h5>LIST DES GROUPES</h5>
                <OrderList v-model="orderlistValue" listStyle="height:250px" dataKey="code" :rows="10">
                    <template #header> Cities </template>
                    <template #item="slotProps">
                        <div>{{ slotProps.item.name }}</div>
                    </template>
                </OrderList>
            </div>
        </div>
    </div>
</template>
