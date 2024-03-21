<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const openSideBar = ref(true)
</script>

<template>
  <div class="w-full h-full flex">
    <AppSidebar :dataOpenSideBar="openSideBar"/>
    <div class="w-full h-full">
      <AppHeader/>
      <div class="w-full has-[calc(100vh-50px)]">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style>
</style>
