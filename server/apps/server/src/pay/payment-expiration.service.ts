import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@libs/shared';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
import dayjs from 'dayjs';

@Injectable()
export class PaymentExpirationService {
  private readonly logger = new Logger(PaymentExpirationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/5 * * * *') // 每5分钟执行
  async handleExpiredPayments() {
    const fifteenMinutesAgo = dayjs().subtract(15, 'minute').toDate();

    try {
      const expiredOrders = await this.prisma.paymentRecord.updateMany({
        where: {
          tradeStatus: {
            in: [TradeStatus.NOT_PAY, TradeStatus.WAIT_BUYER_PAY],
          },
          createdAt: { lt: fifteenMinutesAgo },
        },
        data: {
          tradeStatus: TradeStatus.TRADE_CLOSED,
        },
      });

      if (expiredOrders.count > 0) {
        this.logger.log(`已关闭 ${expiredOrders.count} 个过期订单`);
      }
    } catch (error) {
      this.logger.error('处理过期订单失败', error);
    }
  }
}
