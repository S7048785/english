import { createRouter, createWebHistory } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes";
import { useLoginModalStore, useUserStore } from "@/stores/user.ts";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 添加 404 路由（复用 [...slug].vue 组件）
router.addRoute({
  path: "/404",
  name: "not-found",
  component: () => import("@/views/[...slug].vue"),
});

// 全局前置守卫
router.beforeEach((to, from) => {
  const userStore = useUserStore();
  const loginModalStore = useLoginModalStore();

  // 配合文件路由中定义的 meta 属性做判断
  if (to.meta.requiresAuth && !userStore.user) {
    loginModalStore.setLoginDialogVisible(true);
    return false;
  }
  return true;
});

if (import.meta.hot) {
  handleHotUpdate(router);
}
