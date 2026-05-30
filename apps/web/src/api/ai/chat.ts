import {aiInstance} from "@/api";
import type {ChatMessage, ChatRoleType, Result} from "@en/common";

export const getMessages = (role: ChatRoleType, userId: string): Result<ChatMessage[]> => {
	return aiInstance.get('/chat/list', {
		params: { role,userId },
	})
}

export const clearSession = (role: ChatRoleType, userId: string): Result<void> => {
	return aiInstance.delete('/chat', {
		params: { role, userId },
	})
}