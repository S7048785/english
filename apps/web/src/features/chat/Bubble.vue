<script setup lang="tsx">
import {Globe, Atom, Trash2} from '@lucide/vue';
import {useUserStore} from "@/stores/user.ts";
import {fetchEventSource} from "@microsoft/fetch-event-source";
// import { Chat } from '@ai-sdk/vue';
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import {useChatStore} from "@/stores/chat.ts";
import {clearSession} from "@/api/ai/chat.ts";
import type {ChatMessage} from "@en/common/chat";
// import {DefaultChatTransport} from "ai";
const chatStore = useChatStore()

const userStore = useUserStore()

const message = ref()

const showClearConfirm = ref(false)

const handleClear = async () => {
  await clearSession(chatStore.chatModeIndex, userStore.user!.id)
  chatStore.clearMessages()
  showClearConfirm.value = false
}
// 实例化 Chat
// const chat = new Chat({
//   transport: new DefaultChatTransport({
//     api: '/ai/v1/chat',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: {
//       role: chatStore.chatModeIndex,
//       content: message.value,
//       userId: userStore.user!.id
//     },
//   }),
// })
const sendMessage = () => {
  const userId = userStore.user!.id

  chatStore.addMsg({role: 'human', content: message.value, id: Date.now().toString(), reasoning: ""})
  const aiId = (Date.now() + 1).toString()
  chatStore.addMsg({role: 'ai', content: '', id: aiId, reasoning: ""}) //添加AI的消息
  const tempMsg = message.value
  message.value = ''
  isLoading.value = true
  fetchEventSource('/ai/v1/chat', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: chatStore.chatModeIndex,
      content: tempMsg,
      userId,
      deepThink: selected2.value.deepThink,
      webSearch: selected2.value.webSearch,
    }),
    onmessage: (event) => {
      isLoading.value = false
      if (event.data == '[DONE]') {
        return
      }
      // 根据你后端的数据格式解析，这里假设 event.data 直接是文本片段
      const chunk: ChatMessage = JSON.parse(event.data)
      if (chunk.content) {
        chatStore.addContent(chunk.content)
      }
      if (chunk.reasoning) {
        chatStore.addReasoning(chunk.reasoning)
      }
    },
    onclose: () => {
    },
  })
}

// 选项配置
const options = [
  {label: 'deepThink', value: <Atom size={16}/>, text: '深度思考'},
  {label: 'webSearch', value: <Globe size={16}/>, text: '联网搜索'}
] as const

const selected2 = ref({
  deepThink: false,
  webSearch: false,
})

const selectOption = (value: typeof options[number]["label"]) => {

  selected2.value[value] = !selected2.value[value]
}

const OptionButtons = () => {
  return options.map((item, index) => (
      <button
          key={index}
          onClick={(event) => {
            event.stopPropagation()
            selectOption(item.label)
          }}
          type="button"
          class={`group flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 ease-in-out font-medium text-sm leading-none ${selected2.value[item.label]
              ? 'border-chat-option-active-border bg-chat-option-active text-chat-option-active-text shadow-[0_0_15px_rgba(59,130,246,0.1)]'
              : 'border-chat-option-border bg-chat-option text-chat-option-text hover:text-chat-option-hover-text hover:border-chat-option-hover-border hover:bg-chat-option-hover'}`}
      >
        <div class="w-4 h-4 flex-shrink-0">
          {item.value}
        </div>

        <span>{item.text}</span>
      </button>
  ))
}

const isLoading = ref(false)

const chatRef = useTemplateRef("chatRef")
watch(() => chatStore.list, () => {
  nextTick(() => {
    chatRef.value?.scrollIntoView({
      // behavior: 'smooth'
    })
  })
}, {deep: true, immediate: true});
//markdown解析HTML
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
}))

const parseMarkdown = (content: string) => {
  if (!content) return ''
  return marked.parse(content)
}
</script>

<template>
  <div class="p-5 h-160 bg-chat-background grid grid-rows-[5fr_1fr] relative">
    <div class="overflow-y-auto">
      <div v-for="(item, index) in chatStore.list" :key="index">
        <div class="flex justify-end items-center  gap-4 mt-5 mb-5 mr-5" v-if="item.role === 'human'">
          <div class="text-sm text-white max-w-[80%] rounded-lg p-2 bg-blue-500 shadow-md">
            {{ item.content }}
          </div>
          <div>
            <UAvatar size="lg">user</UAvatar>
          </div>
        </div>
        <div class="flex justify-start gap-4 mt-5 mb-5" v-else>
          <div> <UAvatar size="lg">AI</UAvatar></div>
          <div>
             <div v-if="item.reasoning"
                  class="text-xs text-chat-reasoning-text max-w-[80%] bg-chat-reasoning-bg rounded-lg p-2 mb-2 border-l-2 border-yellow-500">
               <details open>
                 <summary class="cursor-pointer text-chat-reasoning-summary font-medium text-xs mb-1">Deep Think</summary>
                 <div v-html="parseMarkdown(item.reasoning)" />
               </details>
             </div>
            <div v-if="item.role === 'ai' && item.content !== ''"
                 class="text-sm text-chat-ai-bubble-text max-w-[80%] bg-chat-ai-bubble rounded-lg p-2"
                 v-html="parseMarkdown(item.content)" />
          </div>
        </div>
      </div>

      <div v-if="isLoading">
        <UChatShimmer text="Thinking..." />
      </div>
      <div ref="chatRef"></div>
    </div>

    <div>
      <UChatPrompt v-model="message" @submit="sendMessage" :rows="3" :maxrows="3" variant="soft" class="bg-chat-input">
        <!--              <UChatPromptSubmit :status="chat.status" />-->
        <template #footer>
          <div class="flex justify-between items-center w-full">
            <div class="flex items-center gap-3">
              <OptionButtons />
            </div>
            <div>
              <UPopover v-model:open="showClearConfirm">
                <UButton icon="i-lucide-trash-2" size="sm" color="neutral" variant="ghost" class="absolute top-5 right-5 z-10" />
                <template #content>
                  <div class="p-4 text-center min-w-56">
                    <Trash2 class="mx-auto mb-3 text-red-500" :size="32" />
                    <p class="text-sm font-semibold mb-1">确认清空对话</p>
                    <p class="text-xs text-gray-500 mb-4">清空后将无法恢复，确定要继续吗？</p>
                    <div class="flex justify-center gap-2">
                      <UButton size="sm" color="neutral" variant="outline" @click="showClearConfirm = false">取消</UButton>
                      <UButton size="sm" color="error" variant="solid" @click="handleClear">确认清空</UButton>
                    </div>
                  </div>
                </template>
              </UPopover>
              <UButton icon="i-lucide-send" @click="sendMessage" size="lg" color="primary" variant="solid"/>
            </div>
          </div>
        </template>
      </UChatPrompt>

    </div>
  </div>


</template>
