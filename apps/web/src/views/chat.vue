<script setup lang="ts">
import Conversations from "@/features/chat/Conversations.vue";
import Bubble from "@/features/chat/Bubble.vue";
import { useChatStore } from "@/stores/chat.ts";

const chatStore = useChatStore();

onMounted(() => {
  chatStore.initModel();
});
</script>
<template>
  <div class="max-w-300 max-h-160 mx-auto mt-10 grid grid-cols-[1fr_4fr] gap-px bg-chat-grid-gap">
    <Conversations />
    <Bubble />
  </div>
</template>
