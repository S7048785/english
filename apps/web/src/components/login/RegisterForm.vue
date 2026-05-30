<script setup lang="ts">
import {ref, useTemplateRef} from "vue";
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
  <form @submit.prevent.stop="form.handleSubmit" class="space-y-2">
    <div>
      <form.Field :name="'name'">
        <template v-slot="{field}">
          <div class="text-body-large text-medium-emphasis">用户名</div>
          <v-text-field
              :value="field.state.value"
              @update:modelValue="(value: string) => field.handleChange(value)"
              :error-messages="field.state.value ? field.state.meta.errors[0]?.message : ''"
              density="comfortable"
              placeholder="输入用户名"
              autocomplete="off"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
          ></v-text-field>
        </template>
      </form.Field>
    </div>
    <div>
      <form.Field name="phone">
        <template v-slot="{ field }">
          <div class="text-body-large text-medium-emphasis">手机号</div>
          <v-text-field
              :value="field.state.value"
              @update:modelValue="(value: string) => field.handleChange(value)"
              :error-messages="field.state.value ? field.state.meta.errors[0]?.message : ''"
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
          </div>
          <v-text-field
              :value="field.state.value"
              @update:modelValue="(value: string) => field.handleChange(value)"
              :error-messages="field.state.value ? field.state.meta.errors[0]?.message : ''"
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
    <div>
      <form.Field name="email">
        <template v-slot="{ field }">
          <div class="text-body-large text-medium-emphasis">邮箱号 (可选)</div>
          <v-text-field
              :value="field.state.value"
              @update:modelValue="(value: string) => field.handleChange(value)"
              :error-messages="!field.state.value ? '' : field.state.meta.errors[0]?.message"
              density="comfortable"
              placeholder="输入邮箱"
              autocomplete="off"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
          ></v-text-field>
        </template>
      </form.Field>
    </div>

    <div @click="toggle" class="text-right text-body-small text-decoration-none text-blue cursor-pointer">
      已有账号?
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
          {{ isSubmitting ? '...' : '注册' }}
        </v-btn>
      </template>
    </form.Subscribe>

  </form>
</template>

<style scoped>

</style>