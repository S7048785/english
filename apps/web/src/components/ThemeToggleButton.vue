<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import { computed } from "vue";

const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(_isDark: boolean) {
    colorMode.value = _isDark ? "dark" : "light";
  },
});
</script>

<template>
  <UButton
    variant="ghost"
    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    @click="isDark = !isDark"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-4.5"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
      <path d="M12 3l0 18"></path>
      <path d="M12 9l4.65 -4.65"></path>
      <path d="M12 14.3l7.37 -7.37"></path>
      <path d="M12 19.6l8.85 -8.85"></path>
    </svg>
  </UButton>
</template>
