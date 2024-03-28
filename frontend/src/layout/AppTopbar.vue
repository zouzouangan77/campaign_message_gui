<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLayout } from '@/layout/composables/layout'
import { useRouter } from 'vue-router'

const { layoutConfig, onMenuToggle } = useLayout()

const outsideClickListener = ref<((event: any) => void) | null>(null)
const topbarMenuActive = ref(false)
const router = useRouter()

onMounted(() => {
  bindOutsideClickListener()
})

onBeforeUnmount(() => {
  unbindOutsideClickListener()
})

const logoUrl = computed(() => {
  return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`
})

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value
}
const onSettingsClick = () => {
  topbarMenuActive.value = false
  router.push('/documentation')
}
const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value
  }
})

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false
      }
    }
    document.addEventListener('click', outsideClickListener.value)
  }
}
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value)
    outsideClickListener.value = null
  }
}
const isOutsideClicked = (event: MouseEvent) => {
  if (!topbarMenuActive.value) return

  const sidebarEl = document.querySelector('.layout-topbar-menu') as Node
  const topbarEl = document.querySelector('.layout-topbar-menu-button') as Node

  if (!sidebarEl || !topbarEl) return false // Vérification de nullité
  const targetNode = event.target as Node

  return !(
    sidebarEl.isSameNode(targetNode) ||
    sidebarEl.contains(targetNode) ||
    topbarEl.isSameNode(targetNode) ||
    topbarEl.contains(targetNode)
  )
}
</script>

<template>
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <img :src="logoUrl" alt="logo" />
      <span>CAMPAIGNE PSU </span>
    </router-link>

    <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
      <i class="pi pi-bars"></i>
    </button>

    <button
      class="p-link layout-topbar-menu-button layout-topbar-button"
      @click="onTopBarMenuButton()"
    >
      <i class="pi pi-ellipsis-v"></i>
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <i class="pi pi-calendar"></i>
        <span>Calendar</span>
      </button>
      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <i class="pi pi-user"></i>
        <span>Profile</span>
      </button>
      <button @click="onSettingsClick()" class="p-link layout-topbar-button">
        <i class="pi pi-cog"></i>
        <span>Settings</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
