<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {BookOpen, CirclePlay} from "@lucide/vue";
import type {WordList, WordQueryDto} from "@en/common/word";
import {getWordList} from "@/api/server/work-book";
import {useAudio} from "@/composables/core/useAudio.ts";

const {playAudio} = useAudio({})

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
const submitData = computed(() => ({
  page: query.value.page,
  pageSize: query.value.pageSize,
  word: query.value.word || undefined,
  gk: query.value.gk || undefined,     // false 会变成 undefined
  zk: query.value.zk || undefined,
  gre: query.value.gre || undefined,
  toefl: query.value.toefl || undefined,
  ielts: query.value.ielts || undefined,
  cet6: query.value.cet6 || undefined,
  cet4: query.value.cet4 || undefined,
  ky: query.value.ky || undefined,
}));

const queryResult = ref<WordList>()

const onPageChange = (page: number) => {
  console.log(page)
  query.value.page = page;
  getList()
}

const getList = async () => {
  console.log('getList')
  const res = await getWordList(submitData.value)

  queryResult.value = res.data
  console.log(res)
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="max-w-300 mx-auto mt-10 bg-linear-to-br bg-card-background rounded-lg p-10 shadow-lg">
    <div class="h-20">
      <div class="flex items-center gap-2">
        <BookOpen class="text-[#2563EB]"/>
        <span class="text-2xl font-bold text-gray-800 dark:text-gray-400">词库列表</span>
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">词典来源：牛津、柯林斯、BNC、FRQ、高考、中考、GRE、TOEFL、IELTS、大学英语六级、大学英语四级、考研</div>
    </div>
    <div class="flex items-center justify-center gap-x-4">
      <UInput v-model="query.word" @keyup.enter="getList" class="w-100" icon="i-lucide-search" size="xl" variant="outline" placeholder="Search..."/>
      <UButton class="px-6 py-2" @click="getList">查询</UButton>
    </div>
    <div class="flex justify-center gap-4 my-8">
      <UCheckbox v-model="query.gk" variant="list" label="高考" size="xl"/>
      <UCheckbox v-model="query.zk" label="中考" size="xl"></UCheckbox>
      <UCheckbox v-model="query.gre" variant="list" label="GRE" size="xl"></UCheckbox>
      <UCheckbox v-model="query.toefl" variant="list" label="TOEFL" messages="" size="xl"></UCheckbox>
      <UCheckbox v-model="query.ielts" variant="list" label="IELTS" size="xl"></UCheckbox>
      <UCheckbox v-model="query.cet6" variant="list" label="CET-6" size="xl"></UCheckbox>
      <UCheckbox v-model="query.cet4" variant="list" label="CET-4" size="xl"></UCheckbox>
      <UCheckbox v-model="query.ky" variant="list" label="考研" size="xl"></UCheckbox>
    </div>

    <div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="item in queryResult?.list" :key="item.id" class="min-h-50 rounded-lg p-4 border-blue-200 dark:border-blue-600/40 border shadow-md space-y-1 overflow-hidden">
          <div class="inline-flex gap-x-2 flex-wrap">
            <div class="text-lg font-bold text-primary">{{ item.word }}</div>
            <UButton variant="ghost" size="sm" v-if="item.phonetic" @click="playAudio(item.phonetic)">
              <div class="text-sm text-gray-600 dark:text-gray-400 inline-flex items-center gap-2">
                <CirclePlay :size="18" class="text-blue-400"/>
                <span v-html="item.phonetic"></span>
              </div>
            </UButton>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 truncate-2">{{ item.definition }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400" v-html="item.translation"/>
          <div class="text-sm space-x-2 space-y-1 text-gray-600 dark:text-gray-400">
            <!--              <div v-for="tag in item.tag?.split(' ')" :key="tag">{{ tag }}</div>-->
            <UBadge v-if="item.gk" variant="subtle" class=" rounded-full">高考</UBadge>
            <UBadge v-if="item.zk" variant="subtle" class=" rounded-full">中考</UBadge>
            <UBadge v-if="item.gre" variant="subtle" class=" rounded-full">GRE</UBadge>
            <UBadge v-if="item.toefl" variant="subtle" class=" rounded-full">TOEFL</UBadge>
            <UBadge v-if="item.ielts" variant="subtle" class=" rounded-full">IELTS</UBadge>
            <UBadge v-if="item.cet6" variant="subtle" class=" rounded-full">CET-6</UBadge>
            <UBadge v-if="item.cet4" variant="subtle" class=" rounded-full">CET-4</UBadge>
            <UBadge v-if="item.ky" variant="subtle" class=" rounded-full">考研</UBadge>
          </div>
        </div>
      </div>

      <!--      <v-pagination-->
      <!--          v-model="query.page"-->
      <!--          :length="queryResult?.total"-->
      <!--          :total-visible="7"-->
      <!--          @update:modelValue="onPageChange"-->
      <!--      ></v-pagination>-->
        <UPagination class="flex justify-center mt-8" size="lg" v-model:page="query.page" @update:page="onPageChange" show-edges :sibling-count="1" :total="queryResult?.total ? queryResult.total / 12 : 0"/>
    </div>

  </div>


</template>

<style scoped>

</style>