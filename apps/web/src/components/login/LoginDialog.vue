<script setup lang="ts">
import LoginForm from "@/components/login/LoginForm.vue";
import RegisterForm from "@/components/login/RegisterForm.vue";
import {ref} from "vue";
import {useLoginModalStore} from "@/stores/user.ts";
import type {LoginType} from "@/components/login/type.ts";

defineOptions({
  name: "LoginDialogDialog",
});
const loginModalStore = useLoginModalStore();

const loginModel = ref<LoginType>("LOGIN");

const toggleLoginModel = () => {
  loginModel.value = loginModel.value === "LOGIN" ? "REGISTER" : "LOGIN";
};
</script>

<template>
  <UModal v-model:open="loginModalStore.loginDialogVisible" title="">
    <template #body>
      <div class="size-full grid grid-cols-1">
        <!-- 左侧 3D 模型区域 -->
        <!--        <ModelViewer ref="modelViewerRef" :loginModel="loginModel" @toggle="toggleLoginModel"/>-->

        <!-- 右侧登录表单区域 -->
        <div class="flex items-center">
          <div class="w-full">
            <LoginForm v-if="loginModel === 'LOGIN'" @toggle="toggleLoginModel"/>
            <RegisterForm v-if="loginModel === 'REGISTER'" @toggle="toggleLoginModel"/>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
