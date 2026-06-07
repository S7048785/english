import { Module } from '@nestjs/common';
import { PayService } from './pay.service';
import { PayController } from './pay.controller';
import { PaymentExpirationService } from './payment-expiration.service';

/**
 * 支付模块
 * 处理支付相关的所有功能
 */
@Module({
  controllers: [PayController],
  providers: [PayService, PaymentExpirationService],
})
export class PayModule {}
