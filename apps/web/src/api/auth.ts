import axios from "axios";
import type {Result} from "@en/common";
import {useTokenStore, useUserStore} from "@/stores/user.ts";
import {router} from "@/router";
import {serverInstance} from "@/api/index.ts";
import {toast} from "vue-sonner";

const authInstance = axios.create({
	baseURL: `/api/v1`,
	timeout: 50000,
})

authInstance.interceptors.response.use((response) => {
	return response.data;
}, (error) => {
	if (error.response.status === 401) {
		// refresh token过期，清空用户信息
		// useUserStore().logout();
	}
	return Promise.reject(error);
})

export const refreshTokenApi = (): Result<string> => authInstance.post('/user/refresh-token');

//存储失败的请求
// 调整队列类型，同时存储 resolve 和 reject，以便失败时能释放队列
let requestQueue: {
	resolve: (value: any) => void;
	reject: (reason: any) => void;
}[] = []
let isRefreshing = false //是否正在刷新token

export const InertRefresh = async (error: any) => {
	const tokenStore = useTokenStore()
	const originalRequest = error.config;
	// 防止无限重试
	if (originalRequest._retry) {
		return Promise.reject(error);
	}
	originalRequest._retry = true;

	// 处理未登录情况
	if (!tokenStore.accessToken) {
		useUserStore().logout()
		// await alert('用户未登录')
		await router.replace('/')
		return Promise.reject(error);
	}

	// 如果正在刷新token,则将请求存储到队列中,等待token刷新后重新请求
	// 把当前过期的请求“挂起（暂停）”，放进等待队列，等拿到新 Token 后再“复活”并重新发送。
	if (isRefreshing) {
		return new Promise((resolve, reject) => {
			// 改变存储结构，把 reject 也存下来
			requestQueue.push({
				resolve: (newAccessToken: string) => {
					originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
					resolve(serverInstance(originalRequest));
				},
				reject: (err: any) => {
					reject(err);
				}
			})
		})
	}
	// 开始刷新 token
	isRefreshing = true;
	try {
		const res = await refreshTokenApi()
		useTokenStore().setAccessToken(res.data)
		// 【优化】成功后，先消费并清空队列，再重置刷新状态
		const currentQueue = [...requestQueue];
		requestQueue = [];
		isRefreshing = false; // 及时重置，允许后续正常请求进来

		// 成功刷新token，通知队列中挂起的请求重试
		currentQueue.forEach(item => item.resolve(res.data))

		// 重试第一个失败的请求
		originalRequest.headers.set('Authorization', `Bearer ${res.data}`)
		return serverInstance(originalRequest);
	} catch (e: any) {
		if (e.response.status === 401) {
			toast.error(e.response.data.message)
		} else {
			toast.error(e.message)
		}
		// 【核心修复】token 刷新失败，必须通知队列里所有人一起失败，避免页面挂起
		const currentQueue = [...requestQueue];
		requestQueue = [];
		isRefreshing = false;
		currentQueue.forEach(item => item.reject(e));
		// token刷新失败，重新登录
		useUserStore().logout()
		// await alert('用户未登录')
		await router.replace('/')
		return Promise.reject(e || error);
	}

}