import {z} from "zod";

export type ChatRole = 'human' | 'ai'

const VALID_ROLES = ['normal', 'master', 'business', 'qilinge', 'xiaoman'] as const;
export type ChatRoleType = typeof VALID_ROLES[number];

// 消息对象
// export type ChatMessage = {
//   role: ChatRole
//   content: string
// }


// 左侧消息模式的对象
export type ChatMode = {
  label: string
  id: string
  role: ChatRoleType
}

// 发送消息的类型
export type ChatDtoType = {
  role: ChatRoleType
  content: string
  userId: string
  deepThink: boolean; //深度思考
  webSearch: boolean; //联网搜索
}

export const ChatDtoSchema = z.object({
  role: z.string().refine(
    (val) => {
      const normalized = val.trim().toLowerCase();
      return VALID_ROLES.includes(normalized as ChatRoleType);
    },
    {
      message: `无效的角色类型，必须为：${VALID_ROLES.join('、')}`,
    }
  ),
  content: z.string(),
  userId: z.string(),
  deepThink: z.boolean(),
  webSearch: z.boolean(),
});

export type ChatMessage = {
  id: string;
  role: 'human' | 'ai';
  content: string;
  reasoning: string;
}