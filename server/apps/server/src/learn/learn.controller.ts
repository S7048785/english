import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { LearnService } from './learn.service';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

@Controller('learn')
export class LearnController {
  constructor(private readonly learnService: LearnService) {}

  /**
   * 保存单词到wordbook-record
   * @param body
   * @param req
   */
  @UseGuards(AuthGuard)
  @Post()
  saveBatchWord(@Body() body: { wordIds: string[] }, @Req() req: Request) {
    return this.learnService.saveBatchWord(body.wordIds, req.user.userId);
  }

  /**
   * 获取单词列表
   * @param req
   * @param id
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  getWordList(@Req() req: Request, @Param('id') id: string) {
    return this.learnService.getWordList(id, req.user.userId);
  }
}
