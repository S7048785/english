import { getChatMode } from "@/api/ai/prompt.ts";
import type { ChatMessage, ChatMode, ChatRoleType } from "@en/common";
import { getMessages } from "@/api/ai/chat.ts";
import { useUserStore } from "@/stores/user.ts";

export const useChatStore = defineStore("chatStore", () => {
  const list = ref<ChatMessage[]>([]);
  const chatMode = ref<ChatMode[]>([]);
  const chatModeIndex = ref<ChatRoleType>("normal");
  const userStore = useUserStore();

  const initModel = async () => {
    const res = await getChatMode();
    chatMode.value = res.data;
    getChatMessages(chatMode.value[0]!.role);
  };
  const getChatMessages = async (role: ChatRoleType) => {
    chatModeIndex.value = role;
    const { data } = await getMessages(role, userStore.user!.id);
    list.value = data as unknown as ChatMessage[];
  };

  const addMsg = (msg: ChatMessage) => {
    list.value.push(msg);
  };
  const addContent = (content: string) => {
    // const msg = list.value.find(item => item.id === id)
    const msg = list.value[list.value.length - 1];
    if (msg) {
      msg.content += content;
    }
  };
  const addReasoning = (content: string) => {
    const msg = list.value[list.value.length - 1];
    if (msg) {
      msg.reasoning += content;
    }
  };

  const clearMessages = () => {
    list.value = [];
  };

  return {
    list,
    chatMode,
    chatModeIndex,
    initModel,
    getChatMessages,
    addMsg,
    addContent,
    clearMessages,
    addReasoning,
  };
});
