<script setup lang="ts">
import {ref} from "vue";
import { useForm } from '@tanstack/vue-form'
import {getPublicKey as getPublicKeyApi, login} from "@/api/server/user.ts";
import {encryptWithPublicKey} from "@/utils/crypto.ts";
import {UserLoginSchema} from "@en/common";
import {toast} from "vue-sonner";
import {useTokenStore, useUserStore} from "@/stores/user.ts";

const emit = defineEmits<{
  toggle: []
}>()

const passwordVisible = ref(false)

const userStore = useUserStore()

let publicKey = ''
const getPublicKey = async () => {
  if (!publicKey) {
    const {data} = await getPublicKeyApi()
    publicKey = data
  }
  return publicKey
}
const form = useForm({
  defaultValues: {
    phone: '',
    password: ''
  },
  validators: {
    onChange: UserLoginSchema
  },
  onSubmit: async ({ value }) => {
    // Do something with form data

    console.log(value)

    // 获取公钥
    const publicKey = await getPublicKey()
    // 加密密码
    const encryptedPassword = await encryptWithPublicKey(value.password, publicKey)

    try {
      const res = await login({ phone: value.phone, password: encryptedPassword })
      userStore.setUser(res.data.user)

      useTokenStore().setAccessToken(res.data.token)
      toast.success('登录成功')
      userStore.loginDialogVisible = false
    } catch(e: any) {
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
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-400 mb-2">欢迎回来</h1>
    <p class="text-gray-500 text-sm">请登录您的账户以继续</p>
  </div>
  <form @submit.prevent.stop="form.handleSubmit">
    <div>
      <form.Field name="phone">
        <template v-slot="{ field }">
          <div class="text-body-large text-medium-emphasis">手机号</div>
          <v-text-field
              :value="field.state.value"
              @update:modelValue="(value) => field.handleChange(value)"
              :rules="[value => UserLoginSchema.shape.phone.safeParse(value).success || field.state.meta.errors?.[0]?.message!]"
              :validate-on="'blur'"
              density="comfortable"
              placeholder="输入手机号"
              autocomplete="off"
              prepend-inner-icon="mdi-phone-outline"
              variant="outlined"
          ></v-text-field>
        </template>
      </form.Field>
    </div>
    <div>
      <form.Field name="password">
        <template v-slot="{ field }">
          <div class="text-body-large text-medium-emphasis d-flex align-center justify-space-between">
            密码
            <a
                class="text-body-small text-decoration-none text-blue"
                href="#"
                rel="noopener noreferrer"
                target="_blank"
            >
              Forgot login password?</a>
          </div>
          <v-text-field
              :value="field.state.value"
              @update:modelValue="(value) => field.handleChange(value)"
              :rules="[value => UserLoginSchema.shape.password.safeParse(value).success || field.state.meta.errors?.[0]?.message!]"
              :validate-on="'blur'"
              :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="passwordVisible ? 'text' : 'password'"
              density="comfortable"
              placeholder="输入密码"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              autocomplete="current-password"
              @click:append-inner="passwordVisible = !passwordVisible"
          ></v-text-field>
        </template>
      </form.Field>
    </div>
    <div @click="toggle" class="ml-auto w-fit text-body-small text-decoration-none text-blue cursor-pointer">
      没有账号?
    </div>
    <form.Subscribe>
      <template v-slot="{ isSubmitting }">
        <v-btn
            class="my-8"
            color="blue"
            size="large"
            variant="tonal"
            type="submit"
            block
        >
          {{ isSubmitting ? '...' : '登录' }}
        </v-btn>
      </template>
    </form.Subscribe>

  </form>
</template>

<style scoped>

</style>