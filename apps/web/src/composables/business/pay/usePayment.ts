import { ref, onUnmounted } from "vue";
import { createOrder, checkPaymentStatus } from "@/api/server/pay";
import { toast } from "vue-sonner";
import { usePaymentStore } from "@/stores/payment.ts";

/** 轮询间隔（毫秒） */
const POLL_INTERVAL = 3000;

/**
 * 支付 Hook
 * 处理支付流程，包括创建订单、倒计时、轮询支付状态
 */
export const usePayment = () => {
  /** 支付状态存储 */
  const paymentStore = usePaymentStore();
  /** 倒计时显示文本 */
  const countdown = ref("");
  /** 是否正在支付 */
  const isPay = ref(false);
  /** 倒计时定时器 */
  let countdownTimer: NodeJS.Timeout | null = null;
  /** 轮询定时器 */
  let pollTimer: NodeJS.Timeout | null = null;
  /** 轮询中 */
  const isPolling = ref(false);

  /**
   * 格式化倒计时
   * @param expireTime 过期时间戳
   * @returns 格式化后的倒计时文本（MM:SS）
   */
  const formatCountdown = (expireTime: number): string => {
    const now = Date.now();
    const diff = expireTime - now;

    if (diff <= 0) return "已过期";

    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  /**
   * 开始倒计时
   * @param expireTime 过期时间戳
   */
  const startCountdown = (expireTime: number) => {
    // 清除已有定时器
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }

    // 立即更新一次倒计时
    countdown.value = formatCountdown(expireTime);

    // 每秒更新倒计时
    countdownTimer = setInterval(() => {
      countdown.value = formatCountdown(expireTime);
      // 过期后清除定时器
      if (Date.now() >= expireTime) {
        clearInterval(countdownTimer!);
        countdownTimer = null;
      }
    }, 1000);
  };

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    isPolling.value = false;
  };

  /**
   * 开始轮询支付状态
   * @param courseId 课程ID
   */
  const startPolling = (courseId: string) => {
    // 防止重复轮询
    if (isPolling.value) return;

    stopPolling();
    isPolling.value = true;

    pollTimer = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(courseId);
        if (res.data.purchased) {
          // 支付成功，停止轮询并提示
          stopPolling();
          toast.success("购买成功！");
        }
      } catch (e) {
        console.error("轮询支付状态失败:", e);
      }
    }, POLL_INTERVAL);
  };

  /**
   * 发起支付
   * @param courseId 课程ID
   * @returns 是否成功创建订单
   */
  const startPayment = async (courseId: string): Promise<boolean> => {
    try {
      isPay.value = true;
      // 创建订单
      const res = await createOrder(courseId);

      // 保存支付过期时间
      paymentStore.setPayExpire(courseId, res.data.timeExpire);
      // 开始倒计时
      startCountdown(res.data.timeExpire);

      toast.success("订单创建成功，正在跳转支付页面");
      // 打开支付宝支付页面
      window.open(res.data.payUrl, "_blank");

      // 开始轮询支付状态
      startPolling(courseId);

      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || "创建订单失败";
      toast.error(message);
      return false;
    } finally {
      isPay.value = false;
    }
  };

  /**
   * 检查已有支付
   * @param courseId 课程ID
   * @returns 是否存在有效支付
   */
  const checkExistingPayment = (courseId: string): boolean => {
    // 清除过期的支付记录
    paymentStore.clearAllExpired();

    const expire = paymentStore.getPayExpire(courseId);
    if (expire && Date.now() < expire) {
      // 存在有效支付，开始倒计时和轮询
      startCountdown(expire);
      startPolling(courseId);
      return true;
    } else {
      // 无有效支付，清除状态
      countdown.value = "";
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      return false;
    }
  };

  /**
   * 清除支付状态
   * @param courseId 课程ID
   */
  const clearPayment = (courseId: string) => {
    paymentStore.clearPayExpire(courseId);
    countdown.value = "";
    stopPolling();
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    stopPolling();
  });

  return {
    /** 倒计时文本 */
    countdown,
    /** 是否正在支付 */
    isPay,
    /** 是否正在轮询 */
    isPolling,
    /** 发起支付 */
    startPayment,
    /** 检查已有支付 */
    checkExistingPayment,
    /** 清除支付状态 */
    clearPayment,
  };
};
