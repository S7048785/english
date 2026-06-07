import { defineStore } from "pinia";
import { ref } from "vue";

export const usePaymentStore = defineStore(
  "paymentStore",
  () => {
    const payExpireMap = ref<Record<string, number>>({});

    const setPayExpire = (courseId: string, timeExpire: number) => {
      payExpireMap.value[courseId] = timeExpire;
    };

    const getPayExpire = (courseId: string): number | null => {
      return payExpireMap.value[courseId] || null;
    };

    const clearPayExpire = (courseId: string) => {
      delete payExpireMap.value[courseId];
    };

    const clearAllExpired = () => {
      const now = Date.now();
      Object.keys(payExpireMap.value).forEach((courseId) => {
        const expireTime = payExpireMap.value[courseId];
        if (expireTime !== undefined && expireTime <= now) {
          delete payExpireMap.value[courseId];
        }
      });
    };

    return {
      payExpireMap,
      setPayExpire,
      getPayExpire,
      clearPayExpire,
      clearAllExpired,
    };
  },
  { persist: true },
);
