<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { CourseList, Course } from '@en/common/course';
import { AVATAR_UPLOAD_URL as uploadUrl } from '@/api/index.ts';
import { getCourseList, getPurchasedCourseList } from "@/api/server/course.ts";
import {useUserStore, useTokenStore, useLoginModalStore} from "@/stores/user.ts";

const loginModalStore = useLoginModalStore()
const userStore = useUserStore()
const list = ref<CourseList>([]);
const purchasedList = ref<CourseList>([]);
const selectedCourse = ref<Course | null>(null);
const purchaseModalOpen = ref(false);

const getList = async () => {
  const res = await getCourseList();
  list.value = res.data;
}

const getPurchasedList = async () => {
  try {
    const res = await getPurchasedCourseList();
    purchasedList.value = res.data;
  } catch {
    purchasedList.value = [];
  }
}

const imageSrc = (url: string) => {
  return uploadUrl + url;
}

const tabs = [
  { label: '全部课程', slot: 'all' as const },
  { label: '已购课程', slot: 'purchased' as const }
];

const handlePurchase = (course: Course) => {
  selectedCourse.value = course;
  if (!useTokenStore().accessToken || !userStore.user) {
    loginModalStore.setLoginDialogVisible(true);
  } else {
    purchaseModalOpen.value = true;
  }
};

const isPay = ref(false);
const timeExpire = ref(0);
const onPay = () => {
  console.log({
    id: selectedCourse.value!.id
  });
}
onMounted(() => {
  getList();
  getPurchasedList();
})
</script>

<template>
  <div class="min-h-[60vh]">
    <div class="max-w-300 mx-auto px-4 pt-12 pb-24">
      <header class="mb-12 text-center">
        <p class="text-sm font-medium text-indigo-600 tracking-wide uppercase mb-2">Vocabulary Courses</p>
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-gray-300 tracking-tight sm:text-4xl">精选课程</h1>
        <p class="mt-3 text-zinc-500 text-sm max-w-md mx-auto">一次购买，长期有效 · 覆盖高考、考研、四六级、托福雅思等</p>
      </header>

      <UTabs :items="tabs" class="mb-8">
        <template #all>
          <div v-if="list.length === 0" class="text-center py-20 text-zinc-400">
            暂无课程
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article v-for="item in list" :key="item.id"
                     class="group bg-white dark:bg-[#1d232a] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col">
              <div class="relative aspect-4/3 bg-zinc-100 overflow-hidden">
                <img :src="imageSrc(item.url)" :alt="item.name"
                     class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                <div
                    class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-zinc-600 shadow-sm">
                  词汇</div>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-400 line-clamp-1">{{ item.name }}</h2>
                <p class="mt-2 text-sm text-zinc-500 line-clamp-2 leading-relaxed flex-1">{{ item.description }}
                </p>
                <div class="mt-4 pt-4 flex items-center justify-between gap-3">
                  <span class="text-xs text-zinc-400 truncate">讲师 {{ item.teacher }}</span>
                  <span class="text-lg font-bold text-indigo-600 shrink-0">¥{{ item.price }}</span>
                </div>
                <UButton type="button" block
                         class="mt-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 border transition-colors cursor-pointer"
                         @click="handlePurchase(item)">
                  购买课程
                </UButton>
              </div>
            </article>
          </div>
        </template>
        <template #purchased>
          <div v-if="purchasedList.length === 0" class="text-center py-20 text-zinc-400">
            还没有购买任何课程
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article v-for="item in purchasedList" :key="item.id"
                     class="group bg-white dark:bg-[#1d232a] rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 flex flex-col">
              <div class="relative aspect-4/3 bg-zinc-100 overflow-hidden">
                <img :src="imageSrc(item.url)" :alt="item.name"
                     class="absolute inset-0 w-full h-full object-cover" />
                <div
                    class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-green-500/90 text-white text-xs font-medium shadow-sm">
                  已购买</div>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-400 line-clamp-1">{{ item.name }}</h2>
                <p class="mt-2 text-sm text-zinc-500 line-clamp-2 leading-relaxed flex-1">{{ item.description }}</p>
                <div class="mt-4 pt-4 flex items-center justify-between gap-3">
                  <span class="text-xs text-zinc-400 truncate">讲师 {{ item.teacher }}</span>
                  <span class="text-lg font-bold text-green-600 shrink-0">¥{{ item.price }}</span>
                </div>
                <UButton type="button" block color="neutral" variant="soft"
                         class="mt-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer" disabled>
                  已购买
                </UButton>
              </div>
            </article>
          </div>
        </template>
      </UTabs>

      <UModal v-model:open="purchaseModalOpen" :title="selectedCourse?.name">
        <template #body>
          <div v-if="selectedCourse" class="space-y-4">
            <img :src="imageSrc(selectedCourse.url)" :alt="selectedCourse.name"
                 class="w-full h-48 object-cover rounded-lg" />
            <p class="text-zinc-500 text-sm leading-relaxed">{{ selectedCourse.description }}</p>
            <div class="flex items-center justify-between pt-2">
              <span class="text-sm text-zinc-400">讲师 {{ selectedCourse.teacher }}</span>
              <span class="text-2xl font-bold text-indigo-600">¥{{ selectedCourse.price }}</span>
            </div>
          </div>
        </template>
        <template #footer="{ close }">
          <UButton label="取消" color="neutral" variant="outline" @click="close" />
          <UButton label="确认购买" color="primary" @click="onPay"/>
        </template>
      </UModal>
    </div>
  </div>
</template>
