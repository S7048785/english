<script setup lang="ts">
import {onMounted, ref} from "vue";
import {BookOpen, CirclePlay} from "@lucide/vue";
import type {WordList, WordQueryDto} from "@en/common/word";
import {getWordList} from "@/api/server/work-book";

const query = ref<WordQueryDto>({
  page: 1,
  pageSize: 12,
  word: '',
  gk: false,
  zk: false,
  gre: false,
  toefl: false,
  ielts: false,
  cet6: false,
  cet4: false,
  ky: false
})

const queryResult = ref<WordList>()


const onPageChange = (page: number) => {
  console.log(page)
  query.value.page = page;
  getList()
}

const getList = async () => {
  console.log('getList')
  const res = await getWordList(query.value)

  queryResult.value = res.data
  console.log(res)
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="w-[1200px] mx-auto mt-10 bg-linear-to-br bg-card-background rounded-lg p-20 shadow-lg border">
    <div class="h-20">
      <div class="flex items-center gap-2">
        <BookOpen class="text-[#2563EB]"/>
        <span class="text-2xl font-bold text-gray-800 dark:text-gray-400">词库列表</span>
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">词典来源：牛津、柯林斯、BNC、FRQ、高考、中考、GRE、TOEFL、IELTS、大学英语六级、大学英语四级、考研</div>
    </div>
    <div class="flex items-center justify-center">
      <v-text-field
          density="compact"
          label="Search templates"
          hide-details
          single-line
          max-width="400"
          v-model="query.word"
          @keyup.enter="getList"
      />
      <v-btn @click="getList">查询</v-btn>
    </div>
    <div class="flex justify-center gap-4 mb-4">
      <v-checkbox v-model="query.gk" label="高中"></v-checkbox>
      <v-checkbox v-model="query.zk" label="中考"></v-checkbox>
      <v-checkbox v-model="query.gre" label="GRE"></v-checkbox>
      <v-checkbox v-model="query.toefl" label="TOEFL" messages=""></v-checkbox>
      <v-checkbox v-model="query.ielts" label="IELTS"></v-checkbox>
      <v-checkbox v-model="query.cet6" label="CET-6"></v-checkbox>
      <v-checkbox v-model="query.cet4" label="CET-4"></v-checkbox>
      <v-checkbox v-model="query.ky" label="考研"></v-checkbox>
    </div>

    <div>
      <div class="grid grid-cols-4 gap-4">
        <div v-for="item in queryResult?.list" :key="item.id" class="min-h-50 rounded-lg p-4 border-blue-200 border shadow-md space-y-1 overflow-hidden">
            <div class="text-lg font-bold text-primary">{{ item.word }}</div>
            <div v-if="item.phonetic" class="text-sm text-gray-400 inline-flex items-center space-x-2">
              <span v-html="item.phonetic"></span>
              <CirclePlay :size="18" class="text-blue-400"/>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 truncate-2">{{ item.definition }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ item.translation }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div v-for="tag in item.tag?.split(' ')" :key="tag">{{ tag }}</div>
            </div>
          </div>
      </div>

      <v-pagination
          v-model="query.page"
          :length="queryResult?.total"
          :total-visible="7"
          @update:modelValue="onPageChange"
      ></v-pagination>
    </div>

  </div>


</template>

<style scoped>

</style>