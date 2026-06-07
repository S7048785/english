<script setup lang="ts">
import { ref } from "vue";
import { useForm } from "@tanstack/vue-form";
import { getPublicKey as getPublicKeyApi, login } from "@/api/server/user.ts";
import { encryptWithPublicKey } from "@/utils/crypto.ts";
import { UserLoginSchema } from "@en/common";
import { toast } from "vue-sonner";
import { useTokenStore, useUserStore, useLoginModalStore } from "@/stores/user.ts";

const emit = defineEmits<{
  toggle: [];
}>();

const passwordVisible = ref(false);
const loginModalStore = useLoginModalStore();
const userStore = useUserStore();

let publicKey = "";
const getPublicKey = async () => {
  if (!publicKey) {
    const { data } = await getPublicKeyApi();
    publicKey = data;
  }
  return publicKey;
};
const form = useForm({
  defaultValues: {
    phone: "",
    password: "",
  },
  validators: {
    onChange: UserLoginSchema,
  },
  onSubmit: async ({ value }) => {
    // Do something with form data

    console.log(value);

    // 获取公钥
    const publicKey = await getPublicKey();
    // 加密密码
    const encryptedPassword = await encryptWithPublicKey(value.password, publicKey);

    try {
      const res = await login({ phone: value.phone, password: encryptedPassword });
      userStore.setUser(res.data.user);

      useTokenStore().setAccessToken(res.data.token);
      toast.success("登录成功");
      loginModalStore.setLoginDialogVisible(false);
    } catch (e: any) {
      toast.error(e.response.data.message || "注册失败");
    }
  },
});

function toggle() {
  emit("toggle");
}
</script>

<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-400 mb-2">欢迎回来</h1>
    <p class="text-gray-500 text-sm">请登录您的账户以继续</p>
  </div>
  <form @submit.prevent.stop="form.handleSubmit" class="space-y-4">
    <div>
      <form.Field name="phone">
        <template v-slot="{ field }">
          <div class="text-sm font-medium text-default mb-1">手机号</div>
          <UInput
            :value="field.state.value"
            @update:modelValue="field.handleChange as any"
            placeholder="输入手机号"
            autocomplete="off"
            icon="i-lucide-phone"
            variant="outline"
            size="lg"
            class="w-full"
          />
          <div v-if="field.state.meta.errors?.[0]?.message" class="text-xs text-error mt-1">
            {{ field.state.meta.errors[0]?.message }}
          </div>
        </template>
      </form.Field>
    </div>
    <div>
      <form.Field name="password">
        <template v-slot="{ field }">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-default">密码</span>
            <a
              class="text-xs text-primary no-underline"
              href="#"
              rel="noopener noreferrer"
              target="_blank"
            >
              Forgot login password?
            </a>
          </div>
          <UInput
            :value="field.state.value"
            @update:modelValue="field.handleChange as any"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="输入密码"
            autocomplete="current-password"
            icon="i-lucide-lock"
            variant="outline"
            size="lg"
            class="w-full"
          >
            <template #trailing>
              <button
                type="button"
                tabindex="-1"
                class="cursor-pointer"
                @click="passwordVisible = !passwordVisible"
              >
                <UIcon
                  :name="passwordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  class="size-4 text-muted"
                />
              </button>
            </template>
          </UInput>
          <div v-if="field.state.meta.errors?.[0]?.message" class="text-xs text-error mt-1">
            {{ field.state.meta.errors[0]?.message }}
          </div>
        </template>
      </form.Field>
    </div>
    <div @click="toggle" class="ml-auto w-fit text-xs text-primary no-underline cursor-pointer">
      没有账号?
    </div>
    <form.Subscribe>
      <template v-slot="{ isSubmitting }">
        <UButton class="my-8" color="primary" size="lg" :loading="isSubmitting" type="submit" block>
          登录
        </UButton>
      </template>
    </form.Subscribe>
  </form>
</template>

<style scoped></style>
