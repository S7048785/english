import { Module } from '@nestjs/common';
import { DigestService } from './digest.service';
import { BullModule } from '@nestjs/bullmq';
import { digestConfig } from './digest.config';
import { DigestProcessor } from './digest.processor';

@Module({
  providers: [DigestService, DigestProcessor],
  imports: [
    BullModule.registerQueue({
      name: digestConfig.name,
    }),
  ],
})
export class DigestModule {}
