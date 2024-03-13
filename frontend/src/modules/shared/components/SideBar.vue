<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  HomeIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  UsersIcon,
  UserGroupIcon
} from '@heroicons/vue/24/solid'

defineProps<{
  hiddenMenu: boolean
}>()
const menuActif = ref(0)
</script>

<template>
  <aside class="md:col-span-1 md:flex md:justify-end">
    <div>
      <nav class="text-right pt-2">
        <ul :class="{ hidden: hiddenMenu }" class="md:block" id="menu">
          <li
            class="text-gray-400 font-bold hover:text-gray-1000 hover:text-primary-500"
            @click="menuActif = 1"
          >
            <RouterLink
              to="/"
              class="px-4 flex justify-end border-r-4"
              :class="{ 'border-primary-500': menuActif == 1, 'border-white': menuActif != 1 }"
            >
              <span> Accueil </span>
              <HomeIcon class="w-4 ml-2" />
            </RouterLink>
          </li>
          <li
            class="text-gray-400 font-bold hover:text-gray-1000 hover:text-primary-500"
            @click="menuActif = 2"
          >
            <RouterLink
              to="/contact"
              class="px-4 flex justify-end border-r-4"
              :class="{ 'border-primary-500': menuActif == 2, 'border-white': menuActif != 2 }"
            >
              <span> Contacts </span>
              <UsersIcon class="w-4 ml-2" />
            </RouterLink>
          </li>
          <li
            class="text-gray-400 font-bold hover:text-gray-1000 hover:text-primary-500"
            @click="menuActif = 3"
          >
            <RouterLink
              to="/about"
              class="px-4 flex justify-end border-r-4"
              :class="{ 'border-primary-500': menuActif == 3, 'border-white': menuActif != 3 }"
            >
              <span> Groupes </span>
              <UserGroupIcon class="w-4 ml-2" />
            </RouterLink>
          </li>
          <li
            class="text-gray-400 font-bold hover:text-gray-1000 hover:text-primary-500"
            @click="menuActif = 4"
          >
            <RouterLink
              to="/"
              class="px-4 flex justify-end border-r-4"
              :class="{ 'border-primary-500': menuActif == 4, 'border-white': menuActif != 4 }"
            >
              <span> Campagnes </span>
              <PaperAirplaneIcon class="w-4 ml-2" />
            </RouterLink>
          </li>
          <li
            class="text-gray-400 font-bold hover:text-gray-1000 hover:text-primary-500"
            @click="menuActif = 5"
          >
            <RouterLink
              to="/"
              class="px-4 flex justify-end border-r-4"
              :class="{ 'border-primary-500': menuActif == 5, 'border-white': menuActif != 5 }"
            >
              <span> Messages </span>
              <EnvelopeIcon class="w-4 ml-2" />
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>
