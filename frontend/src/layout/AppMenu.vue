<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'UI Components',
        items: [
            { label: 'Contact', icon: 'pi pi-fw pi-comment', to: '/contact' },
            { label: 'Groupe', icon: 'pi pi-fw pi-users', to: '/group' },
            { label: 'Campaigne', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
            { label: 'Message', icon: 'pi pi-fw pi-telegram', to: '/uikit/panel' },
      
        ]
    },

  

]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <template v-if="!('separator' in item)">
                <app-menu-item :item="item" :index="i"></app-menu-item>
            </template>
            <template v-else>
                <li class="menu-separator"></li>
            </template>
        </template>
    </ul>
</template>


<style lang="scss" scoped></style>
