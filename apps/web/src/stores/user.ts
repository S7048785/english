import { defineStore } from "pinia";
import { ref } from "vue";
import type { UserResult } from "@en/common";
import { logout as logoutApi } from "@/api/server/user.ts";
import { AVATAR_UPLOAD_URL } from "@/api";

export const useUserStore = defineStore(
  "userStore",
  () => {
    const user = ref<UserResult | null>();

    const setUser = (param: UserResult) => {
      user.value = param;
    };
    const defaultAvatar = computed(() =>
      user
        ? `${AVATAR_UPLOAD_URL}${user.value?.avatar}`
        : "https://gips3.baidu.com/it/u=3493347002,3356558679&fm=3074&app=3074&f=PNG?w=2048&h=2048",
    );
    const logout = async () => {
      user.value = null;
      const tokenStore = useTokenStore();
      tokenStore.setAccessToken(null); // 退出时清除 token
      logoutApi();
    };
    return {
      defaultAvatar,
      user,
      setUser,
      logout,
    };
  },
  { persist: true },
);

export const useLoginModalStore = defineStore("loginModalStore", () => {
  const loginDialogVisible = ref(false);
  const setLoginDialogVisible = (param: boolean) => {
    loginDialogVisible.value = param;
  };
  return { loginDialogVisible, setLoginDialogVisible };
});

export const useTokenStore = defineStore(
  "tokenStore",
  () => {
    const accessToken = ref<string | null>(null);
    const setAccessToken = (param: string | null) => {
      accessToken.value = param;
    };
    return {
      accessToken,
      setAccessToken,
    };
  },
  { persist: true },
);
