import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import {useUserStore} from "@/stores/user.ts";


export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from) => {
  const userStore = useUserStore()

  // 配合文件路由中定义的 meta 属性做判断
  if (to.meta.requiresAuth && !userStore.user) {
    userStore.loginDialogVisible = true
    return false
  }
  return true
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
