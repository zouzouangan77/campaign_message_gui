<template>

    <div class="h-screen first:bg-gray-800">
        <div class="bg-gray-700 h-[50px]">
           <div class="text-xl font-bold text-center flex-items-center justify-center text-white h-full">Campagne de message</div>
        </div>



        <div class="flex-flex-col justify-between has-[calc(100vh-3rem)] bg-gray-900">
            <div class="menu-man text-left px-2 whitespace-nowrap">
                <div class="profile flex justify-center items-center text-center p-5">
                    <div class="text-center text-white">
                        <img src="@/assets/logo.png" class="p-1 w-24 h-24 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 mb-4" alt="Avatar"/>
                        <h5 class="text-xl font-medium leading-tight mb-2">My name</h5>

                    </div>
                </div>
                <div class="py-3 rounded-md cursor-pointer text-gray-300 hover:text-white">
                    <RouterLink to="/" class="px-2 flex space-x-2">
                            <span class="pi pi-microsoft" v-tooltip.right="Dashbaord"> </span> <span> Acceuil</span>
                           
                    </RouterLink>
                </div>

                <div class="py-3 rounded-md cursor-pointer text-gray-300 hover:text-white">
                    <RouterLink to="/contact" class="px-2 flex space-x-2">
                            <span class="pi pi-phone" v-tooltip.right="Contacts"> </span> <span> Contacts</span>
                           
                    </RouterLink>
                </div>

                <div class="py-3 rounded-md cursor-pointer text-gray-300 hover:text-white">
                    <RouterLink to="/" class="px-2 flex space-x-2">
                            <span class="pi pi-users" v-tooltip.right="Groupes"> </span> <span> Groupes</span>
                           
                    </RouterLink>
                </div>

                <div class="py-3 rounded-md cursor-pointer text-gray-300 hover:text-white">
                    <RouterLink to="/" class="px-2 flex space-x-2">
                            <span class="pi pi-send" v-tooltip.right="Campagnes"> </span> <span> Campagnes</span>
                           
                    </RouterLink>
                </div>

            </div>
            <div class="menu-man text-left px-2 justify-self-end whitespace-nowrap">
                <div class="py-3 rounded-md cursor-pointer text-gray-300 hover:text-white">
                    <RouterLink to="/" class="px-2 flex space-x-2">
                            <span class="pi pi-send" v-tooltip.right="Campagnes"> </span> <span> Campagnes</span>                          
                    </RouterLink>
                </div>
        </div>
            

        </div>
       
      
    </div>
        
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

defineProps<{
  hiddenMenu: boolean
}>()
const menuActif = ref(0)
</script>

