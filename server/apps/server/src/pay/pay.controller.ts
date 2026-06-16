import {
  Controller,
  Post,
  Get,
  Req,
  Query,
  UseGuards,
  All,
  HttpException,
} from '@nestjs/common';
import { PayService } from './pay.service';
import type { Request } from 'express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';

/**
 * 支付控制器
 * 处理支付相关的HTTP请求
 */
@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  /**
   * 创建支付订单
   * @param courseId 课程ID
   * @param req 请求对象，包含用户信息
   * @returns 支付链接和过期时间
   */
  @UseGuards(AuthGuard)
  @Post()
  create(@Query('id') courseId: string, @Req() req: Request) {
    return this.payService.create(courseId, req.user.userId);
  }

  /**
   * 检查支付状态
   * @param courseId 课程ID
   * @param req 请求对象，包含用户信息
   * @returns 是否已购买
   */
  @UseGuards(AuthGuard)
  @Get('status')
  async checkStatus(@Query('courseId') courseId: string, @Req() req: Request) {
    return this.payService.checkPaymentStatus(courseId, req.user.userId);
  }

  /**
   * 获取当前用户已购买的课程列表
   * @param req 请求对象，包含用户信息
   * @returns 已购买的课程列表
   */
  @UseGuards(AuthGuard)
  @Get('purchased-courses')
  async getPurchasedCourses(@Req() req: Request) {
    return this.payService.getPurchasedCourses(req.user.userId);
  }

  /**
   * 支付宝回调通知
   * 接收支付宝异步通知，处理支付结果
   * @param req 请求对象，包含支付宝回调参数
   */
  @All('notify')
  async notify(@Req() req: Request) {
    const params = req.body;
    if (!this.payService.checkSign(params)) {
      throw new HttpException('签名验证失败', 400);
    }
    // console.log('支付回调参数:', params);
    const { userId, courseId } = JSON.parse(params.body);
    await this.payService.handleAlipayNotify(
      userId, // userId，用于识别用户
      courseId,
      params.out_trade_no, // 商户订单号
      params.trade_status as TradeStatus, // 交易状态
      params.trade_no, // 支付宝交易号
      params.gmt_payment, // 交易付款时间
    );
  }
}
