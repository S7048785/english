<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center px-4">
    <h1 class="text-8xl font-bold text-zinc-200 dark:text-zinc-700 mb-4">404</h1>
    <p class="text-zinc-500 dark:text-zinc-400 mb-8">页面不存在</p>
    <UButton label="返回首页" @click="goHome" />
  </div>
</template>
