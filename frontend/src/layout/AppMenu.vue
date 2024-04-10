<script setup lang="ts">
import { ref } from 'vue'

import AppMenuItem from './AppMenuItem.vue'

const model = ref([
  {
    label: 'ACCUEIL',
    items: [{ label: 'Accueil', icon: 'pi pi-fw pi-home', to: '/' }]
  },
  {
    label: 'INFORMATIONS',
    items: [
      { label: 'Mes Contacts', icon: 'pi pi-fw pi-comment', to: '/contact' },
      { label: 'Mes Groupes', icon: 'pi pi-fw pi-users', to: '/group' },
      { label: 'Mes Pièce-jointes', icon: 'pi pi-fw pi-link', to: '/attachment' },
      { label: 'Mes Messages', icon: 'pi pi-fw pi-telegram', to: '/message' },
      { label: 'Mes Campagnes', icon: 'pi pi-fw pi-share-alt', to: '/campaign' }
    ]
  }
])
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
