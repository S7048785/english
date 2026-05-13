<script setup lang="tsx">
import {RouterLink} from 'vue-router'
import {House, Wand, Notebook, BookOpen, Settings, Sun, Star} from '@lucide/vue'
import {usePersistedTheme} from "@/hooks";

const {toggleTheme} = usePersistedTheme()

const menuList = [
  {name: '主页', path: '/', icon: <House size={16}/>},
  {name: 'AI', path: '/smart/chat', icon: <Wand size={16}/>},
  {name: '词库', path: '/word-book', icon: <Notebook size={16}/>},
  {name: '课程', path: '/courses', icon: <BookOpen size={16}/>},
  {name: '设置', path: '/setting', icon: <Settings size={16}/>},
]

const renderMenu = () => (
    <div class="flex items-center gap-x-8 text-gray-500">
      {menuList.map((item, index) => (
          <div key={index}>
            <RouterLink to={item.path} class="inline-flex items-center gap-2 p-2 hover:text-indigo-600 ">
              {item.icon}
              {item.name}
            </RouterLink>
          </div>
      ))}
    </div>
)
</script>

<template>
  <header class="flex items-center justify-center gap-x-8 w-full p-4 border-b border-gray-200">
    <div class="inline-flex items-center gap-x-8">
      <div class="text-2xl font-bold bg-indigo-700 text-white rounded-[10px] px-2 py-1 w-10 flex items-center justify-center h-10 ">
        E
      </div>
      <div class="text-xl font-bold">English App</div>
    </div>
    <div class="flex items-center gap-x-8 text-gray-500">
      <renderMenu />
    </div>

    <div class="inline-flex items-center gap-x-4 text-gray-500">
      <div class="flex items-center gap-2 bg-blue-200 text-blue-700 rounded-full px-4 py-1">
        <Sun :size="16"/>
          <span class="font-bold text-sm">0</span></div>
      <div class="flex items-center gap-2 bg-amber-200 text-amber-700 rounded-full px-4 py-1">
        <Star :size="16"/>
          <span class="font-bold text-sm">0</span></div>
    </div>

    <div class="flex gap-4">
      <div class="flex items-center gap-2 border-l cursor-pointer border-gray-500 pl-4">
        <img class="w-10 h-10 rounded-full ml-2 mr-2"
             src="https://gips3.baidu.com/it/u=3493347002,3356558679&fm=3074&app=3074&f=PNG?w=2048&h=2048" alt=""/>
        <span class="text-sm font-bold">未登录</span>
      </div>
      <v-btn icon variant="text" @click="toggleTheme" rounded="lg" size="small">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4.5"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 3l0 18"></path><path d="M12 9l4.65 -4.65"></path><path d="M12 14.3l7.37 -7.37"></path><path d="M12 19.6l8.85 -8.85"></path></svg>
      </v-btn>
    </div>
  </header>
</template>