import { serverInstance } from "@/api";
import type { ResultPay } from "@en/common/pay";
import type { Result } from "@en/common/response";

/**
 * 创建支付订单
 * @param courseId 课程ID
 * @returns 支付链接和过期时间
 */
export const createOrder = (courseId: string): Result<ResultPay> => {
  return serverInstance.post(`/pay?id=${courseId}`);
};

/**
 * 检查支付状态
 * @param courseId 课程ID
 * @returns 是否已购买
 */
export const checkPaymentStatus = (courseId: string): Result<{ purchased: boolean }> => {
  return serverInstance.get(`/pay/status?courseId=${courseId}`);
};
