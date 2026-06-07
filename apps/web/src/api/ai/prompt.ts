import { aiInstance } from "@/api";
import type { ChatMode, Result } from "@en/common";

export const getChatMode = (): Result<ChatMode[]> => aiInstance.get("/prompt/list");
