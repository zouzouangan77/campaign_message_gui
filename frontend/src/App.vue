<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue'
import SideBar from './modules/shared/components/SideBar.vue'
import { Bars3Icon } from '@heroicons/vue/24/solid'

const hiddenMenu = ref(false)
</script>

<template>
  <header class="bg-blue-200 flex justify-between items-center border-b border-gray-300">
    <div class="grow flex items-center">
      <img alt="Vue logo" src="@/assets/logo.png" width="125" height="125" />
      <h1 class="grow md:text-5xl sm:text-3xl text-2xl text-center">Campagne d'envoi de message</h1>
    </div>
    <div class="px-4 cursor-pointer md:hidden w-10">
      <Bars3Icon class="w-6" @click="hiddenMenu = !hiddenMenu" />
    </div>
  </header>
  <div class="text-gray-600 grid md:grid-cols-7">
    <SideBar :hiddenMenu="hiddenMenu" />
    <main class="px-16 py-6 bg-gray-100 md:col-span-6">
      <RouterView />
    </main>
  </div>

  <footer class="w-full bg-blue-200 text-gray-600 h-20 flex justify-center items-center text-center">
    <p>&copy; Copyright 2065 CMCI &amp; Jeunesse Vie. Tous droits reversés.</p>
  </footer>
</template>

<style scoped>
/* header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
