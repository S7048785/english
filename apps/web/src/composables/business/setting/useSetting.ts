import { useForm } from "@tanstack/vue-form";
import { UserUpdateSchema } from "@en/common/index.ts";
import { ref, shallowRef, useTemplateRef } from "vue";
import { useUserStore } from "@/stores/user.ts";
import { uploadAvatar, userUpdate } from "@/api/server/user.ts";
import { toast } from "vue-sonner";
import { AVATAR_UPLOAD_URL } from "@/api";
import { parseTime, Time } from "@internationalized/date";

export function useSettingHook() {
  const userStore = useUserStore();

  // 1. 声明那些 Vuetify 必须依赖的独立 Ref
  const isTimingTaskSwitch = ref(userStore.user?.isTimingTask || false);
  // const timingTaskTime = ref(userStore.user?.timingTaskTime || "")
  const timingTaskTime = shallowRef(new Time(0, 0));
  const timingTaskTimeShow = ref(false);
  const avatarPreview = ref(userStore.user ? `${AVATAR_UPLOAD_URL}${userStore.user.avatar}` : "");
  const fileInputRef = useTemplateRef<HTMLInputElement | null>("fileInputRef");

  // 2. 初始化表单
  const form = useForm({
    defaultValues: {
      name: userStore.user?.name || "",
      email: userStore.user?.email || "",
      isTimingTask: userStore.user?.isTimingTask || false,
      timingTaskTime: userStore.user?.timingTaskTime || "",
      address: userStore.user?.address || "",
      bio: userStore.user?.bio || "",
      avatar: userStore.user?.avatar || "",
    },
    validators: {
      onChange: UserUpdateSchema,
    },
    // 将原本的 updateUser 直接融进 onSubmit 中
    onSubmit: async ({ value }) => {
      try {
        const res = await userUpdate({
          name: value.name,
          email: value.email,
          address: value.address,
          bio: value.bio,
          avatar: value.avatar,
          //Vuetify 单独维护的值在这里组装
          isTimingTask: isTimingTaskSwitch.value,
          timingTaskTime: timingTaskTime.value.toString(),
        });

        userStore.setUser({
          ...userStore.user!,
          ...res.data,
        });
        toast.success("更新成功");
      } catch (error) {
        toast.error("更新失败");
      }
    },
  });

  // 3. 文件上传逻辑
  const triggerUpload = () => {
    (fileInputRef.value as any).inputRef?.click();
  };

  const uploadFile = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log("开始上传文件:", file.name);
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAvatar(formData);

      // 同步表单内部的值与外部预览 ref
      avatarPreview.value = res.data.previewUrl;
      form.setFieldValue("avatar", res.data.databaseUrl);
      toast.success("头像上传成功");
    } catch {
      toast.error("头像上传失败");
    }
  };

  // 重置表单
  const resetForm = () => {
    form.reset({
      name: userStore.user?.name || "",
      email: userStore.user?.email || "",
      isTimingTask: userStore.user?.isTimingTask || false,
      timingTaskTime: userStore.user?.timingTaskTime || "",
      address: userStore.user?.address || "",
      bio: userStore.user?.bio || "",
      avatar: userStore.user?.avatar || "",
    });
    timingTaskTime.value = parseTime(userStore.user?.timingTaskTime || "00:00");
    avatarPreview.value = userStore.user ? `${AVATAR_UPLOAD_URL}${userStore.user.avatar}` : "";
  };

  // 5. 暴露出 template 中需要使用的所有状态和方法
  return {
    form,
    isTimingTaskSwitch,
    timingTaskTime,
    timingTaskTimeShow,
    avatarPreview,
    fileInputRef,
    triggerUpload,
    uploadFile,
    resetForm,
  };
}
