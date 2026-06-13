import axios from "axios";
import type { Result } from "@en/common";
import { useTokenStore, useUserStore } from "@/stores/user.ts";
import { router } from "@/router";
import { serverInstance } from "@/api/index.ts";
import { toast } from "vue-sonner";

const authInstance = axios.create({
  baseURL: `/api/v1`,
  timeout: 50000,
});

authInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response.status === 401) {
      // refresh token过期，清空用户信息
      // useUserStore().logout();
    }
    return Promise.reject(error);
  },
);

export const refreshTokenApi = (): Result<string> => authInstance.post("/user/refresh-token");

//存储失败的请求
// 调整队列类型，同时存储 resolve 和 reject，以便失败时能释放队列
let requestQueue: {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}[] = [];
let isRefreshing = false; //是否正在刷新token

export const InertRefresh = async (error: any) => {
  const tokenStore = useTokenStore();
  const originalRequest = error.config;
  // 防止无限重试
  if (originalRequest._retry) {
    return Promise.reject(error);
  }
  originalRequest._retry = true;

  // 处理未登录情况
  if (!tokenStore.accessToken) {
    useUserStore().logout();
    // await alert('用户未登录')
    await router.replace("/");
    return Promise.reject(error);
  }

  // 所有请求（包括触发刷新的那个）都入队等待
  return new Promise((resolve, reject) => {
    requestQueue.push({
      resolve: (newAccessToken: string) => {
        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        resolve(serverInstance(originalRequest));
      },
      reject: (err: any) => {
        reject(err);
      },
    });

    // 只有第一个请求负责触发刷新
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenApi()
        .then((res) => {
          useTokenStore().setAccessToken(res.data);
          const currentQueue = [...requestQueue];
          requestQueue = [];
          isRefreshing = false; // 及时重置，允许后续正常请求进来

          // 成功刷新token，通知队列中挂起的请求重试
          currentQueue.forEach((item) => item.resolve(res.data));
        })
        .catch((e) => {
          // 【核心修复】token 刷新失败，必须通知队列里所有人一起失败，避免页面挂起
          const currentQueue = [...requestQueue];
          requestQueue = [];
          isRefreshing = false;
          currentQueue.forEach((item) => item.reject(e));
          // token刷新失败，重新登录
          useUserStore().logout();
          // await alert('用户未登录')
          router.replace("/");
        });
    }
  });
};
