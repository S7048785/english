import { Injectable, OnModuleInit } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import dayjs from 'dayjs';
import { createAgent } from 'langchain';
import { PrismaService } from '@libs/shared';
import { createModel } from '../llm/llm.config';
import marked from 'marked';
import { Queue } from 'bullmq';
import { digestConfig } from './digest.config';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class DigestService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(digestConfig.name) private readonly queue: Queue,
  ) {}

  private readonly agent = createAgent({
    model: createModel(),
    tools: [this.queryTool()],
    systemPrompt:
      '你是一个单词记忆助手，根据用户信息和单词记录，生成单词记忆报告',
  });

  async onModuleInit() {
    // 向消息队列注册定时任务
    await this.queue.add(
      digestConfig.task.everyDayDigest,
      {},
      {
        repeat: {
          pattern: '0 0 * * *', // 每天0点执行
        },
      },
    );
  }

  private queryTool() {
    return tool(
      async ({ userId }: { userId: string }) => {
        // 查询当前用户和当天已学习的单词记录
        return this.prismaService.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            email: true,
            name: true,
            wordNumber: true,
            wordBookRecords: {
              where: {
                createdAt: {
                  //今天00:00:00 - 明天00:00:00
                  // .startOf('day')：将时间 重置到当天的开始，即 00:00:00.000。
                  gte: dayjs().startOf('day').toDate(),
                  // .add(1, 'day')：在当前时刻上 增加 1 天（保持时分秒等不变）
                  lte: dayjs().add(1, 'day').startOf('day').toDate(),
                },
              },
              select: {
                word: {
                  select: {
                    word: true,
                  },
                },
              },
            },
          },
        });
      },
      {
        name: 'queryTool',
        description: '根据用户id查询用户学习的单词记录',
        schema: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: '用户id' },
          },
          required: ['userId'],
        },
      },
    );
  }

  async handleMailDigest() {
    //1.筛选高质量用户(打开定时任务 + 定时任务有时间 + 今天学过的单词 + 邮箱不为空)
    const users = await this.prismaService.user.findMany({
      where: {
        isTimingTask: true, //开启了定时任务
        timingTaskTime: { not: '' }, //定时任务时间不为空
        email: { not: null }, //邮箱不为空
        wordBookRecords: {
          //some: 至少有一个 every全部满足 none空的
          //createdAt创建时间00:00:00 - 明天的00:00:00
          some: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(), //>=今天00:00:00
              lte: dayjs().add(1, 'day').startOf('day').toDate(), //<=明天00:00:00
            },
          },
        },
      },
      select: {
        id: true,
        timingTaskTime: true,
        email: true,
      },
    });
    for (const user of users) {
      const result = await this.agent.invoke({
        messages: [
          {
            role: 'user',
            content: `查询用户信息,并且根据用户id关联单词记录表，查询出用户今天的单词记录,用户id: ${user.id}，过滤掉敏感信息`,
          },
        ],
      });
      // 获取结果
      const content = result.messages.at(-1)?.content;
      if (content) {
        const html = await marked.parse(content as string);
        const [hour, minute] = user.timingTaskTime.split(':').map(Number);

        // 发送邮件的时间
        const target = dayjs()
          .startOf('day')
          .set('hour', hour)
          .set('minute', minute);
        // 与当前时间对比，计算出时间差（毫秒）
        let delay = target.diff(dayjs());
        // 当天已经过了发送时间延迟到第二天发送
        if (delay > 0) {
          // 作业立即被添加到 Redis 中，但被存放在“延迟集合”（delayed set）里，不会立即被 Worker 消费。
          this.queue.add(
            digestConfig.task.emailDigest,
            {
              userId: user.id,
              text: html,
              email: user.email,
            },
            // 第 1 次失败 -> 等 5 秒重试
            // 第 2 次失败 -> 等 10 秒重试
            // 第 3 次失败 -> 任务标记为失败、进入 failed 状态
            {
              delay: delay,
              attempts: 3, // 最多重试3次
              backoff: {
                type: 'exponential',
                delay: 5000, // 初始延迟时间5秒
              },
              // 使用userId作为 jobId，用户修改定时任务时间后，自动覆盖任务
              jobId: user.id,
            },
          );
        }
      }
    }
  }
}
