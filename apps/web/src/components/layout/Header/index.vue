<script setup lang="tsx">
import { RouterLink } from 'vue-router'
import { Sun, Star } from '@lucide/vue'
import { useLoginModalStore } from '@/stores/user.ts'
import { useUserStore } from "@/stores/user.ts";
import { AVATAR_UPLOAD_URL } from "@/api";
import {ref} from "vue";
import type { NavigationMenuItem } from '@nuxt/ui'

const loginModalStore = useLoginModalStore()

const userStore = useUserStore()
const menuList = ref<NavigationMenuItem[][]>([
  [
    {
      label: '主页',
      icon: 'i-lucide-house',
      to: '/'
    },
    {
      label: 'AI',
      icon: 'i-lucide-wand',
      to: '/chat'
    },
    {
      label: '词库',
      icon: 'i-lucide-notebook',
      to: '/word-book',
    },
    {
      label: '课程',
      icon: 'i-lucide-book-open',
      to: '/courses',
    },
    {
      label: '设置',
      icon: 'i-lucide-settings',
      to: '/setting',
    }
  ]
])
const defaultAvatar = userStore.user ? `${AVATAR_UPLOAD_URL}${userStore.user.avatar}` : 'https://gips3.baidu.com/it/u=3493347002,3356558679&fm=3074&app=3074&f=PNG?w=2048&h=2048'
</script>

<template>
  <header class="flex items-center justify-between lg:justify-center gap-x-8 w-full p-4 border-b border-gray-200 dark:border-gray-700">
    <div class="hidden lg:inline-flex items-center gap-x-8 ">
      <div
        class="text-2xl font-bold bg-indigo-700 text-white rounded-[10px] px-2 py-1 w-10 flex items-center justify-center h-10 ">
        E
      </div>
      <div class="text-xl font-bold">English App</div>
    </div>
    <div class="flex items-center gap-x-8 text-gray-500">
      <UNavigationMenu color="neutral" :items="menuList" class=""/>
    </div>

    <div class="inline-flex items-center gap-x-4 text-gray-500">
      <div class="flex items-center gap-2 bg-blue-200 text-blue-700 rounded-full px-4 py-1">
        <Sun :size="16" />
        <span class="font-bold text-sm">{{ userStore.user?.dayNumber ?? '0' }}</span>
      </div>
      <div class="flex items-center gap-2 bg-amber-200 text-amber-700 rounded-full px-4 py-1">
        <Star :size="16" />
        <span class="font-bold text-sm">{{ userStore.user?.wordNumber ?? '0' }}</span>
      </div>
    </div>

    <div class="flex gap-4">
      <UPopover>
        <div class="flex items-center gap-2 border-l cursor-pointer border-gray-300 dark:border-gray-700 pl-4">
          <img class="w-10 h-10 rounded-full ml-2 mr-2" :src="defaultAvatar" alt="" />
          <span class="text-sm font-bold">{{ userStore.user?.name ?? '未登录' }}</span>
        </div>
        <template #content>
          <div v-if="userStore.user" class="p-6 space-y-4 min-w-80 gap-x-4">
            <div class="flex gap-x-4 w-80">
              <div class="shadow-xs p-2 rounded border border-gray-200 flex-1">
                <div class="text-sm text-slate-700 dark:text-slate-300">单词数量</div>
                <div class="font-bold text-2xl">{{ userStore.user.wordNumber }}</div>
              </div>
              <div class="flex-1 shadow-xs p-2 rounded border border-amber-200 bg-yellow-50 dark:bg-amber-600/10 dark:border-amber-700">
                <div class="text-sm text-slate-700 dark:text-slate-300">打卡天数</div>
                <div class="font-bold text-2xl">{{ userStore.user.dayNumber }}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-x-4">
               <UButton class="inline-flex justify-center">
                 <RouterLink :to="'/setting'">个人资料</RouterLink>
               </UButton>
                <UPopover>
                  <!-- 触发按钮 -->
                  <UButton class="inline-flex justify-center" color="error" black>
                    退出
                  </UButton>

                  <!-- 气泡内容 -->
                  <template #content>
                    <div class="p-4">
                      <div class="text-subtitle-2 mb-2">确定要退出吗？</div>
                      <div class="flex justify-end gap-2">
                        <UButton color="error" @click="userStore.logout">确定</UButton>
                      </div>
                    </div>
                  </template>
                </UPopover>
            </div>
          </div>
          <div v-else class="p-6 bg-card-background space-y-4">
            <div class="flex space-x-4">
              <img class="w-10 h-10 rounded-full ml-2 mr-2" :src="defaultAvatar" alt="" />
              <div>
                <p class="font-bold text-md">游客</p>
                <p class="text-sm">登录后可同步词库进度与打卡数据</p>
              </div>
            </div>
            <UButton @click="() => {loginModalStore.setLoginDialogVisible(true)}" :color="'primary'" block variant="solid">去登陆
            </UButton>
          </div>
        </template>
      </UPopover>
      <ThemeToggleButton />
    </div>
  </header>
</template>

<style scoped>
:deep(.router-link-active) {

  /*noinspection CssUnresolvedCustomProperty*/
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
}
</style>