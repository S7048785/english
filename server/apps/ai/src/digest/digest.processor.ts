import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { digestConfig } from './digest.config';
import { EmailService } from '@libs/shared';
import { DigestService } from './digest.service';

// const jobs = {
//   [digestConfig.task.emailDigest]: (data) => {
//     const { userId, text, email } = data;
//   },
//   [digestConfig.task.everyDayDigest]: () => {},
// };

// 消费者
@Processor(digestConfig.name)
export class DigestProcessor extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly digestService: DigestService,
  ) {
    super();
  }

  async process(job: Job) {
    // jobs[job.name]?.(job.data);

    if (job.name === digestConfig.task.emailDigest) {
      // 邮件发送
      const { text, email } = job.data;
      try {
        await this.emailService.sendEmail(email, '每日单词记忆报告', text);
      } catch (error) {
        console.log('邮件发送失败', error);
      }
    } else if (job.name === digestConfig.task.everyDayDigest) {
      // 开启每日定时任务
      await this.digestService.handleMailDigest();
    }
  }
}
