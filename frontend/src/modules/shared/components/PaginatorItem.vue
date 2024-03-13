<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import type { PageState, PaginatorProps } from '../types'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/16/solid'

const props = withDefaults(defineProps<PaginatorProps>(), {
  totalRecords: 0,
  rows: 10,
  pageLinkSize: 5,
  rowsPerPageOptions: () => [10, 20, 30, 40, 50]
})

const pageState: Ref<PageState> = ref({
  first: 1,
  rows: 10,
  page: 1,
  pageCount: 0
})

const last = computed(() => {
  const cal = pageState.value.first + pageState.value.rows - 1
  return Math.min(cal, props.totalRecords)
})

const pageLinkList = computed(() => {
  const links: number[] = []
  const maxSize = Math.min(pageState.value.pageCount, props.pageLinkSize)

  let minBorder = pageState.value.page - 1
  let maxBorder = pageState.value.page
  let direction = true //true for add rigth (push), false for add left(unshift)

  do {
    if (direction && maxBorder <= pageState.value.pageCount) {
      links.push(maxBorder)
      maxBorder++
    } else if (!direction && minBorder >= 1) {
      links.unshift(minBorder)
      minBorder--
    }
    direction = !direction
  } while (links.length < maxSize)

  return links
})

const emit = defineEmits<{
  page: [event: PageState]
}>()

onMounted(() => {
  initPageState()
})

watch(props, () => {
  initPageState()
})

function initPageState() {
  pageState.value.rows = props.rows ? props.rows : props.rowsPerPageOptions[0]
  pageState.value.first = (pageState.value.page - 1) * pageState.value.rows + 1
  pageState.value.pageCount = Math.ceil(props.totalRecords / (props.rows != 0 ? props.rows : 1))
}

function clickButtonPrevious() {
  if (pageState.value.page > 1) {
    pageState.value.page = pageState.value.page - 1
    pageState.value.first = (pageState.value.page - 1) * pageState.value.rows + 1
  }
  emit('page', pageState.value)
}

function clickButtonFirst() {
  pageState.value.page = 1
  pageState.value.first = (pageState.value.page - 1) * pageState.value.rows + 1
  emit('page', pageState.value)
}

function clickButtonNext() {
  if (pageState.value.page < pageState.value.pageCount) {
    pageState.value.page = pageState.value.page + 1
    pageState.value.first = (pageState.value.page - 1) * pageState.value.rows + 1
  }
  emit('page', pageState.value)
}

function clickButtonLast() {
  pageState.value.page = pageState.value.pageCount
  pageState.value.first = (pageState.value.page - 1) * pageState.value.rows + 1
  emit('page', pageState.value)
}

function clickButtonPage(pageIndice: number) {
  pageState.value.page = pageIndice
  pageState.value.first = (pageState.value.page - 1) * pageState.value.rows + 1
  emit('page', pageState.value)
}

function handleChangeSelect() {
  pageState.value.pageCount = Math.ceil(props.totalRecords / pageState.value.rows)
  if (pageState.value.page > pageState.value.pageCount) {
    pageState.value.page = pageState.value.pageCount
  }
  pageState.value.first = (pageState.value.page - 1) * pageState.value.rows + 1
  emit('page', pageState.value)
}
</script>
<template>
  <nav
    class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
    aria-label="Table navigation"
  >
    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
      Affichage
      <span class="font-semibold text-gray-900 dark:text-white"
        >{{ pageState.first }}-{{ last }}</span
      >
      Sur
      <span class="font-semibold text-gray-900 dark:text-white">{{ totalRecords }}</span>
    </span>
    <ul class="inline-flex items-stretch -space-x-px">
      <li @click="pageState.page != 1 && clickButtonPrevious()">
        <a
          class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          :class="{
            'bg-white': pageState.page !== 1,
            'bg-gray-100': pageState.page === 1,
            'text-gray-700': pageState.page === 1
          }"
        >
          <span class="sr-only">Previous</span>

          <ChevronLeftIcon class="w-5 h-5" />
        </a>
      </li>
      <li @click="pageState.page != 1 && clickButtonFirst()">
        <a
          :class="{
            'bg-white': pageState.page !== 1,
            'bg-gray-100': pageState.page === 1,
            'text-gray-700': pageState.page === 1
          }"
          class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <span class="sr-only">First</span>

          <ChevronDoubleLeftIcon class="w-5 h-5" />
        </a>
      </li>
      <li
        v-for="page in pageLinkList"
        :key="page"
        @click="page !== pageState.page && clickButtonPage(page)"
      >
        <a
          :class="{ 'bg-white': page != pageState.page, 'bg-primary-50': page == pageState.page }"
          class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >{{ page }}</a
        >
      </li>

      <li
        @click="pageState.page !== pageState.pageCount && clickButtonLast()"
        class="bg-gray-100 text-gray-700"
      >
        <a
          :class="{
            'bg-gray-100': pageState.page === pageState.pageCount,
            'text-gray-700': pageState.page === pageState.pageCount,
            'bg-white': pageState.page !== pageState.pageCount
          }"
          class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <span class="sr-only">Last</span>

          <ChevronDoubleRightIcon class="w-5 h-5" />
        </a>
      </li>
      <li @click="pageState.page !== pageState.pageCount && clickButtonNext()">
        <a
          :class="{
            'bg-gray-100': pageState.page === pageState.pageCount,
            'text-gray-700': pageState.page === pageState.pageCount,
            'bg-white': pageState.page !== pageState.pageCount
          }"
          class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <span class="sr-only">Next</span>
          <ChevronRightIcon class="w-5 h-5" />
        </a>
      </li>
      <li>
        <div class="mx-2">
          <select
            v-model="pageState.rows"
            @change="handleChangeSelect"
            class="h-9 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option v-for="option in rowsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
      </li>
    </ul>
  </nav>
</template>
