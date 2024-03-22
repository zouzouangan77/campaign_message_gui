<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import AppTopbar from './AppTopbar.vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppConfig from './AppConfig.vue';
import { useLayout } from '@/layout/composables/layout';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();

const outsideClickListener = ref<null | ((event: MouseEvent) => void)>(null);


watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

const containerClass = computed(() => {
    return {
        'layout-theme-light': typeof layoutConfig.darkTheme.value === 'string' && layoutConfig.darkTheme.value === 'light',
        'layout-theme-dark': typeof layoutConfig.darkTheme.value === 'string' && layoutConfig.darkTheme.value === 'dark',
        'layout-overlay':typeof layoutConfig.menuMode.value === 'string' && layoutConfig.menuMode.value === 'overlay',
        'layout-static': typeof layoutConfig.menuMode.value === 'string' && layoutConfig.menuMode.value === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive.value,
        'layout-mobile-active': layoutState.staticMenuMobileActive.value,
        'p-ripple-disabled': layoutConfig.ripple.value === false
    };
});
const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive.value = false;
                layoutState.staticMenuMobileActive.value = false;
                layoutState.menuHoverActive.value = false;
            }
        };
        if (outsideClickListener.value) {
            document.addEventListener('click', outsideClickListener.value);
        }
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event: MouseEvent) => {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    if (!sidebarEl || !topbarEl) return false; // Vérification de nullité
    const targetNode = event.target as Node; 

       return !(sidebarEl.isSameNode(targetNode) || sidebarEl.contains(targetNode) || topbarEl.isSameNode(targetNode) || topbarEl.contains(targetNode));
};

</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <app-topbar></app-topbar>
        <div class="layout-sidebar">
            <app-sidebar></app-sidebar>
        </div>
        <div class="layout-main-container">
            <div class="layout-main">
                <router-view></router-view>
            </div>
            <app-footer></app-footer>
        </div>
        <app-config></app-config>
        <div class="layout-mask"></div>
    </div>
    <Toast />
</template>

<style lang="scss" scoped></style>
