<script setup lang="ts">

import {customRef, ref} from "vue";
import type {Word} from "@en/common";
import {getWordList} from "@/api/server/work-book.ts";
import {toast} from "vue-sonner";

const isOpen = ref(false)
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'f' && e.ctrlKey) {
    e.preventDefault()
    isOpen.value = true
    console.log(3)
  }
})

const wordList = ref<Word[]>([])

const copyWord = (word: string) => {
  try {
    navigator.clipboard.writeText(word)
    toast.success("Copied!")
  } catch (e) {
    toast.error("Copy failed!")
  }
}

let timer: ReturnType<typeof setTimeout> | null
const searchRef = customRef((track, trigger) => {
  let value = ''
  return {
    get() {
      track()
      return value;
    },
    set(newValue: string) {
      value = newValue

      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (value)
          onSearch()
        trigger()
      }, 500)
    }
  }
})

const onSearch = async () => {
  const {data} = await getWordList({
    page: 1,
    pageSize: 10,
    word: searchRef.value
  })

  wordList.value = data.list
}
</script>

<template>
  <UModal v-model:open="isOpen" :overlay="false">
    <template #content>
      <div>
        <UInput autofocus class="w-full" size="xl" icon="i-lucide-search" color="neutral" variant="subtle" placeholder="Search..." v-model.trim="searchRef"/>
        <div v-if="wordList.length > 0" class="w-full mx-auto max-h-[500px] overflow-y-auto">
          <UButton block color="neutral" variant="ghost" border="0"  v-for="item in wordList" @click="copyWord(item.word)" :key="item.id">
            <div class="px-4 py-2 text-left w-full">
              <div class="font-semibold text-blue-600 mb-1">{{ item.word }}</div>
              <div v-html="item.translation" class="text-sm mb-1 text-gray-800 dark:text-gray-400 overflow-hidden line-clamp-2"/>
            </div>
          </UButton>

        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>