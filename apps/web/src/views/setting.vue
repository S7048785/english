<script setup lang="ts">
import { useUserStore } from "@/stores/user.ts";
import { useSettingHook } from "@/composables/business/setting/useSetting.ts";

definePage({
  meta: { requiresAuth: true },
});
const {
  form,
  isTimingTaskSwitch,
  timingTaskTime,
  timingTaskTimeShow,
  avatarPreview,
  fileInputRef,
  triggerUpload,
  resetForm,
  uploadFile,
} = useSettingHook();

const userStore = useUserStore();
</script>

<template>
  <div class="max-w-300 mx-auto p-10">
    <div class="flex">
      <div>
        <p class="text-xl font-bold mb-2">设置</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">在这里修改你的个人信息与头像</p>
      </div>
      <div class="ml-auto space-x-4">
        <UButton size="lg" variant="subtle" color="neutral" @click="resetForm">重置</UButton>
        <form.Subscribe>
          <template v-slot="{ isSubmitting }">
            <UButton :disabled="isSubmitting" size="lg" @click="form.handleSubmit">保存</UButton>
          </template>
        </form.Subscribe>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-x-4">
      <div class="space-y-5">
        <div class="p-4 border dark:border-slate-600 border-slate-200 shadow">
          <p class="text-lg">头像</p>
          <div class="my-4"></div>
          <div class="flex gap-x-4 items-center">
            <img :src="avatarPreview" alt="avatar" class="w-18 h-18 rounded-full" />
            <div class="space-y-2">
              <UButton @click="triggerUpload">选择头像</UButton>
              <!-- 被隐藏的文件输入框 -->
              <UInput class="hidden" type="file" ref="fileInputRef" @change="uploadFile" />
              <!--              <v-file-input ref="fileInputRef" class="d-none" @change="uploadFile"></v-file-input>-->
              <p class="text-sm text-slate-500 dark:text-slate-400">
                支持 png/jpg/webp，建议小于2MB
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 border dark:border-slate-600 border-slate-200 shadow">
          <p class="text-lg">账号</p>
          <div class="my-4"></div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-400">登录状态</span>
              <UBadge size="lg" color="success" variant="outline">已登录</UBadge>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-600 dark:text-slate-400">退出登录</span>
              <UPopover>
                <UButton label="退出" color="error" variant="subtle" />

                <template #content>
                  <div class="p-3 mt-2">
                    <div class="text-subtitle-2 mb-2">确定要退出吗？</div>
                    <div class="flex justify-end gap-2">
                      <!-- Vuetify 没有自带 gap，可以用 class="mr-2" 或样式控制 -->
                      <UButton label="确定" size="sm" color="error" @click="userStore.logout" />
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border dark:border-slate-600 border-slate-200 shadow">
        <div class="text-lg">个人信息</div>
        <div class="my-4"></div>
        <div class="space-y-6">
          <form.Field name="name">
            <template v-slot="{ field }">
              <div class="grid grid-cols-[1fr_4fr] gap-x-4">
                <div class="required-label text-sm text-slate-600 dark:text-slate-400 text-right">
                  昵称
                </div>
                <UInput
                  size="xl"
                  :value="field.state.value"
                  @update:modelValue="field.handleChange as any"
                  placeholder="请输入用户名"
                />
              </div>
            </template>
          </form.Field>

          <form.Field name="email">
            <template v-slot="{ field }">
              <div class="grid grid-cols-[1fr_4fr] gap-x-4">
                <div class="text-sm text-slate-600 dark:text-slate-400 text-right">邮箱</div>
                <UInput
                  size="xl"
                  :value="field.state.value"
                  @update:modelValue="field.handleChange as any"
                  placeholder="请输入邮箱"
                />
              </div>
            </template>
          </form.Field>
          <div class="grid grid-cols-[1fr_4fr] gap-x-4">
            <div class="required-label text-sm text-slate-600 dark:text-slate-400 text-right">
              定时任务
            </div>
            <USwitch size="xl" v-model="isTimingTaskSwitch" />
            <!--            <v-switch hide-details color="primary" v-model="isTimingTaskSwitch" density="compact" inset></v-switch>-->
          </div>

          <div class="grid grid-cols-[1fr_4fr] gap-x-4">
            <div class="required-label text-sm text-slate-600 dark:text-slate-400 text-right">
              定时任务时间
            </div>
            <UInputTime
              size="xl"
              v-model="timingTaskTime"
              :hour-cycle="24"
              :disabled="!isTimingTaskSwitch"
            />
            <!--            <v-text-field hide-details density="compact" variant="outlined" :value="timingTaskTime"-->
            <!--              placeholder="请输入定时任务时间" :disabled="!isTimingTaskSwitch" readonly>-->
            <!--              <v-menu v-model="timingTaskTimeShow" :close-on-content-click="false" activator="parent" min-width="0">-->
            <!--                <v-time-picker v-model="timingTaskTime"></v-time-picker>-->
            <!--              </v-menu>-->
            <!--            </v-text-field>-->
          </div>
          <form.Field name="address">
            <template v-slot="{ field }">
              <div class="grid grid-cols-[1fr_4fr] gap-x-4">
                <div class="text-sm text-slate-600 dark:text-slate-400 text-right">地址</div>
                <UInput
                  size="xl"
                  :value="field.state.value"
                  @update:modelValue="field.handleChange as any"
                  placeholder="请输入地址"
                />
              </div>
            </template>
          </form.Field>

          <form.Field name="bio">
            <template v-slot="{ field }">
              <div class="grid grid-cols-[1fr_4fr] gap-x-4">
                <div class="text-sm text-slate-600 dark:text-slate-400 text-right">签名</div>
                <UInput
                  size="xl"
                  :value="field.state.value"
                  @update:modelValue="field.handleChange as any"
                  placeholder="写点什么介绍一下自己"
                />
              </div>
            </template>
          </form.Field>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.required-label::before {
  content: "*";
  color: #ef4444;
  /* 红色 */
  margin-right: 2px;
}
:deep([data-slot="segment"]:focus),
:deep([data-slot="segment"][data-focused]) {
  background-color: var(--color-bermuda) !important; /* Tailwind 的 red-500 颜色 */
}
</style>
