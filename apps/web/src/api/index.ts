import axios from "axios";
import { useTokenStore } from "@/stores/user.ts";
import { InertRefresh } from "@/api/auth.ts";
import { toast } from "vue-sonner";

// TODO: 生产环境地址
const AVATAR_UPLOAD_URL = import.meta.env.DEV ? "http://localhost:9000" : "";
const serverInstance = axios.create({
  baseURL: `/api/v1`,
  timeout: 50000,
});

serverInstance.interceptors.request.use((config) => {
  const token = useTokenStore().accessToken;
  token && config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

serverInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.message == "Network Error") {
      toast.error("网络异常，请检查网络");
      return Promise.reject(error);
    }
    // console.log(error.response.data.message);

    // accessToken过期则刷新，refreshToken过期则清空用户信息重新登录
    if (error.response.status === 401) {
      // 返回刷新token后的请求
      return await InertRefresh(error);
    }
    return Promise.reject(error);
  },
);

const aiInstance = axios.create({
  baseURL: `/ai/v1`,
  timeout: 50000,
});

aiInstance.interceptors.request.use((config) => {
  config.headers.set("X-Custom-Header", "foobar");
  return config;
});

aiInstance.interceptors.response.use((response) => {
  return response.data;
});

export { serverInstance, aiInstance, AVATAR_UPLOAD_URL };
