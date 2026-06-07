<script setup lang="ts">
import { useChatStore } from "@/stores/chat.ts";
const chatStore = useChatStore();
</script>

<template>
  <div class="p-5 rounded-lg bg-chat-sidebar">
    <div
      @click="chatStore.getChatMessages(value.role)"
      :class="{
        'bg-chat-sidebar-item-active text-chat-sidebar-item-active-text':
          chatStore.chatModeIndex === value.role,
      }"
      class="rounded-lg p-2 transition-all duration-300 hover:bg-chat-sidebar-item-hover"
      v-for="value in chatStore.chatMode"
      :key="value.id"
    >
      <div class="text-sm cursor-pointer p-2 px-4">
        {{ value.label }}
      </div>
    </div>
  </div>
</template>
