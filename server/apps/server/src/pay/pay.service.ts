import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AlipayService, PrismaService } from '@libs/shared';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';

/**
 * 支付服务
 * 处理支付相关的业务逻辑
 */
@Injectable()
export class PayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alipayService: AlipayService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 生成交易号
   * @returns 格式为 PAY-{nanoid} 的交易号
   */
  private createTradNo() {
    const prefix = 'PAY';
    return `${prefix}-${nanoid(12)}`;
  }

  /**
   * 创建支付订单
   * @param courseId 课程ID
   * @param userId 用户ID
   * @returns 支付链接和过期时间
   */
  async create(courseId: string, userId: string) {
    // 查询课程信息
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      throw new HttpException('课程不存在', HttpStatus.NOT_FOUND);
    }
    const [courseRecord, paymentRecord] = await Promise.all([
      this.prisma.courseRecord.findFirst({
        where: {
          userId,
          courseId,
        },
      }),
      this.prisma.paymentRecord.findFirst({
        where: {
          userId,
          course_id: courseId,
        },
        orderBy: {
          createdAt: 'desc', // 按创建时间倒序，第一条就是最新的
        },
      }),
    ]);
    if (
      courseRecord ||
      (paymentRecord &&
        paymentRecord.tradeStatus === TradeStatus.TRADE_SUCCESS) ||
      paymentRecord?.tradeStatus === TradeStatus.NOT_PAY
    ) {
      throw new HttpException('您已购买此课程', HttpStatus.CONFLICT);
    }
    // 开启事务管理
    return this.prisma.$transaction(async (tx) => {
      // 生成订单号
      const outTradeNo = this.createTradNo();
      // 创建支付记录
      const order = await tx.paymentRecord.create({
        data: {
          userId,
          outTradeNo: outTradeNo,
          amount: course.price,
          subject: course.name,
          body: course.description || '',
          course_id: courseId,
        },
      });
      // 设置订单过期时间（15分钟）
      const datetime = dayjs().add(15, 'minute');
      // 构建支付宝请求参数
      const bizContent = {
        out_trade_no: order.outTradeNo,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        subject: order.subject,
        body: JSON.stringify({ userId, courseId }), // 将userId存入body字段，用于回调时识别用户
        total_amount: order.amount.toString(),
        time_expire: datetime.format('YYYY-MM-DD HH:mm:ss'),
      };

      console.log('支付请求参数:', bizContent);
      // 调用支付宝接口获取支付链接
      const result = this.alipayService.alipaySdk.pageExecute(
        'alipay.trade.page.pay',
        'GET',
        {
          bizContent,
          notify_url: `${this.configService.get<string>('ALIPAY_NOTIFY_URL')!}/api/v1/pay/notify`,
        },
      );
      return {
        payUrl: result,
        timeExpire: datetime.toDate().getTime(),
      };
    });
  }

  /**
   * 检查支付状态
   * @param courseId 课程ID
   * @param userId 用户ID
   * @returns 是否已购买
   */
  async checkPaymentStatus(courseId: string, userId: string) {
    const courseRecord = await this.prisma.courseRecord.findFirst({
      where: {
        userId,
        courseId,
        isPurchased: true,
      },
    });
    return { purchased: !!courseRecord };
  }

  /**
   * 获取用户已购买的课程列表
   * @param userId 用户ID
   * @returns 已购买的课程列表（精简字段）
   */
  async getPurchasedCourses(userId: string) {
    const courseRecords = await this.prisma.courseRecord.findMany({
      where: {
        userId,
        isPurchased: true,
      },
      include: {
        course: true,
      },
    });
    return courseRecords.map((record) => ({
      id: record.course.id,
      name: record.course.name,
      description: record.course.description,
      teacher: record.course.teacher,
      url: record.course.url,
      price: Number(record.course.price).toString(),
    }));
  }

  /**
   * 处理支付宝回调通知
   * @param userId 用户ID（从回调的body字段获取）
   * @param courseId 课程id
   * @param outTradeNo 商户订单号
   * @param tradeStatus 交易状态
   * @param tradeNo 支付宝交易号
   * @param gmt_payment 交易付款时间
   */
  async handleAlipayNotify(
    userId: string,
    courseId: string,
    outTradeNo: string,
    tradeStatus: TradeStatus,
    tradeNo: string,
    gmt_payment: string,
  ) {
    console.log('支付回调参数:', userId, outTradeNo, tradeStatus, tradeNo);
    // 只处理交易成功的情况
    if (tradeStatus === TradeStatus.TRADE_SUCCESS) {
      await this.prisma.$transaction(async (tx) => {
        // 更新支付记录状态
        const updateResult = await tx.paymentRecord.update({
          where: {
            outTradeNo,
          },
          data: {
            tradeStatus,
            // 转为日期对象
            sendPayTime: dayjs(gmt_payment).toDate(),
            tradeNo,
          },
        });
        // 创建课程购买记录
        await tx.courseRecord.create({
          data: {
            userId,
            courseId,
            isPurchased: true,
            paymentRecordId: updateResult.id,
          },
        });
      });
    }
  }
}
