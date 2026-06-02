import { Module } from '@nestjs/common';
import { PayService } from './pay.service';

@Module({
  providers: [PayService]
})
export class PayModule {}
