import {clearSession} from "@/api/ai/chat.ts";
import {useUserStore} from "@/stores/user.ts";
import {useChatStore} from "@/stores/chat.ts";
import {fetchEventSource} from "@microsoft/fetch-event-source";
import type {ChatMessage} from "@en/common/chat";

export const useBubble = () => {
	const chatStore = useChatStore()
	const userStore = useUserStore()

	const message = ref()

	const showClearConfirm = ref(false)

	const handleClear = async () => {
		await clearSession(chatStore.chatModeIndex, userStore.user!.id)
		chatStore.clearMessages()
		showClearConfirm.value = false
	}
	const isLoading = ref(false)
	const selected2 = ref({
		deepThink: false,
		webSearch: false,
	})
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

	const chatRef = useTemplateRef("chatRef")
	watch(() => chatStore.list, () => {
		nextTick(() => {
			(chatRef.value as HTMLDivElement).scrollIntoView({
				// behavior: 'smooth'
			})
		})
	}, {deep: true, immediate: true});

	return {
		message,
		isLoading,
		selected2,
		sendMessage,
		chatRef,
		showClearConfirm,
		handleClear,
	}
}