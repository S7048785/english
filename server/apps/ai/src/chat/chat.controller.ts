import { Controller, Get, Post, Delete, Body, Res, Req, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { ChatRoleType } from '@en/common';
import type { Request, Response } from 'express';
import { ChatDto } from './dto';
import { AIMessageChunk } from 'langchain';

/**
 * AIMessageChunk {
 *     "id": "chatcmpl-0f6433ce-7c6c-95ef-9a36-a1fe9884c8f0",
 *     "content": "",
 *     "additional_kwargs": {
 *       "reasoning_content": "React如何简单使用\"，"
 *     },
 *     "response_metadata": {
 *       "model_provider": "openai",
 *       "usage": {}
 *     },
 *     "tool_calls": [],
 *     "tool_call_chunks": [],
 *     "invalid_tool_calls": []
 *   }
 */
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createChatDto: ChatDto, @Res() res: Response) {

    // SSE 流式输出
    res.setHeader('Content-Type', 'text/event-stream');
    // 不缓存
    res.setHeader('Cache-Control', 'no-cache');
    // 保持连接
    res.setHeader('Connection', 'keep-alive');
    const stream = await this.chatService.create(createChatDto);
    for await (const chunk of stream) {
      const [msg] = chunk
      // 流式循环时区分 ai消息类型
      // 只有 AI 模型输出的消息才会推送到前端，ToolMessageChunk（搜索工具的原始结果）会被跳过
      if (msg instanceof AIMessageChunk) {
        res.write(`data: ${JSON.stringify({
          id: msg.id,
          content: msg.content,
          reasoning: msg.additional_kwargs.reasoning_content,
          role: 'ai',
        })}\n\n`);
      }
    }
    // 4. 当循环结束，说明大模型已经全部输出完毕，发送结束标记
    res.write(`data: [DONE]\n\n`);
    res.end(); // 主动关闭当前的 HTTP 连接
  }

  // @UseGuards(AuthGuard)
  @Get('list')
  async findAll(@Req() req: Request, @Query('role') role: ChatRoleType, @Query('userId') userId: string) {
    return await this.chatService.findAll(userId, role);
  }

  // @UseGuards(AuthGuard)
  @Delete()
  async clearSession(@Query('userId') userId: string, @Query('role') role: ChatRoleType) {
    await this.chatService.clearSession(userId, role);
    return { message: '会话已清除' };
  }

}
