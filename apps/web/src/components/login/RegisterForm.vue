<script setup lang="ts">
import {ref} from "vue";
import {useForm} from '@tanstack/vue-form'
import { register} from "@/api/server/user.ts";
import {UserRegisterSchema} from "@en/common";
import {toast} from "vue-sonner";
import {useTokenStore, useUserStore} from "@/stores/user.ts";

const emit = defineEmits<{
  toggle: []
}>()

const passwordVisible = ref(false)

const userStore = useUserStore()

const form = useForm({
  defaultValues: {
    phone: '',
    password: '',
    name: '',
    email: ''
  },
  validators: {
    onChange: UserRegisterSchema,
  },
  onSubmit: async ({value}) => {
    // Do something with form data
    console.log(value)

    try {
      const res = await register({phone: value.phone, password: value.password, name: value.name, email: value.email})
      userStore.setUser(res.data.user)

      useTokenStore().setAccessToken(res.data.token)
      toast.success('注册成功')
      userStore.loginDialogVisible = false
    } catch (e: any) {
      toast.error(e.response.data.message || '注册失败')
    }
  },
})

function toggle() {
  emit('toggle')
}

</script>

<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-400 mb-2">欢迎注册</h1>
    <p class="text-gray-500 text-sm">请填写以下信息以完成注册</p>
  </div>
  <form @submit.prevent.stop="form.handleSubmit" class="space-y-4">
    <div>
      <form.Field name="name">
        <template v-slot="{field}">
          <div class="text-sm font-medium text-default mb-1">用户名</div>
          <UInput
              :value="field.state.value"
              @update:modelValue="field.handleChange as any"
              placeholder="输入用户名"
              autocomplete="off"
              icon="i-lucide-user"
              variant="outline"
              size="lg"
              class="w-full"
          />
          <div v-if="field.state.value && field.state.meta.errors?.[0]?.message" class="text-xs text-error mt-1">{{ field.state.meta.errors[0]?.message }}</div>
        </template>
      </form.Field>
    </div>
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
          <div v-if="field.state.value && field.state.meta.errors?.[0]?.message" class="text-xs text-error mt-1">{{ field.state.meta.errors[0]?.message }}</div>
        </template>
      </form.Field>
    </div>
    <div>
      <form.Field name="password">
        <template v-slot="{ field }">
          <div class="text-sm font-medium text-default mb-1">密码</div>
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
              <button type="button" tabindex="-1" class="cursor-pointer" @click="passwordVisible = !passwordVisible">
                <UIcon :name="passwordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4 text-muted" />
              </button>
            </template>
          </UInput>
          <div v-if="field.state.value && field.state.meta.errors?.[0]?.message" class="text-xs text-error mt-1">{{ field.state.meta.errors[0]?.message }}</div>
        </template>
      </form.Field>
    </div>
    <div>
      <form.Field name="email">
        <template v-slot="{ field }">
          <div class="text-sm font-medium text-default mb-1">邮箱号 (可选)</div>
          <UInput
              :value="field.state.value"
              @update:modelValue="field.handleChange as any"
              placeholder="输入邮箱"
              autocomplete="off"
              icon="i-lucide-mail"
              variant="outline"
              size="lg"
              class="w-full"
          />
          <div v-if="field.state.value && field.state.meta.errors?.[0]?.message" class="text-xs text-error mt-1">{{ field.state.meta.errors[0]?.message }}</div>
        </template>
      </form.Field>
    </div>

    <div @click="toggle" class="text-right text-xs text-primary no-underline cursor-pointer">
      已有账号?
    </div>
    <form.Subscribe>
      <template v-slot="{ isSubmitting }">
        <UButton
            class="my-8"
            color="primary"
            size="lg"
            :loading="isSubmitting"
            type="submit"
            block
        >
          注册
        </UButton>
      </template>
    </form.Subscribe>
  </form>
</template>

<style scoped>

</style>