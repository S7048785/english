import { Injectable, OnModuleInit } from '@nestjs/common';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { type ChatRoleType } from '@en/common';
import { createAgent } from 'langchain';
import type { BaseMessage } from '@langchain/core/messages';
import { createCheckPoint, createModel } from '../llm/llm.config';
import { chatMode } from '../prompt/prompt.mode';
import { bochaWebSearchTool } from '../tools/web-search';
import { ConfigService } from '@nestjs/config';
import { ChatDto } from './dto';
import type { DynamicStructuredTool } from '@langchain/core/tools';

@Injectable()
export class ChatService implements OnModuleInit {
  private checkPointer: PostgresSaver;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.checkPointer = await createCheckPoint();
  }

  async create(dto: ChatDto, userId: string) {
    const llm = createModel();
    const mode = chatMode[dto.role];

    if (dto.deepThink) {
      llm.modelKwargs!.enable_thinking = true;
    }

    const tools: DynamicStructuredTool[] = [];
    if (dto.webSearch) {
      tools.push(bochaWebSearchTool(this.configService));
      llm.maxTokens = 18000;
    }

    const agent = createAgent({
      model: llm,
      systemPrompt: mode.prompt,
      checkpointer: this.checkPointer,
      tools,
    });

    const id = `${userId}-${dto.role}`;
    return agent.stream(
      {
        // 用户输入提示词
        messages: [{ role: 'human', content: dto.content }],
      },
      {
        configurable: { thread_id: id },
        streamMode: 'messages',
      },
    );
  }

  async findAll(userId: string, role: ChatRoleType) {
    const messages = (await this.checkPointer.get({
      configurable: { thread_id: `${userId}-${role}` },
    }))!;
    return ((messages?.channel_values?.messages ?? []) as BaseMessage[])
      .filter((item) => item.type !== 'tool')
      .map((item) => ({
        id: item.id,
        content: item.content as string,
        reasoning: (item.additional_kwargs as any)?.reasoning_content,
        role: item.type,
      }));
  }

  async clearSession(userId: string, role: ChatRoleType) {
    const threadId = `${userId}-${role}`;
    await this.checkPointer.deleteThread(threadId);
  }
}
