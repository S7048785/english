<script setup lang="ts">
import DefaultDefaultLayout from "@/components/layout/DefaultLayout.vue";
import GlobalSearch from "@/components/GlobalSearch.vue";
import LoginDialogDialog from "@/components/login/LoginDialog.vue";
import "vue-sonner/style.css";
import {Toaster} from "vue-sonner";
import {getUserInfo as getUserInfoApi} from "@/api/server/user.ts";
import {onMounted} from "vue";
import {useUserStore} from "@/stores/user.ts";

const userStore = useUserStore();

const getUserInfo = async () => {
  try {
    const {data} = await getUserInfoApi();
    userStore.setUser(data);
  } catch (error) {
    console.error("获取用户信息失败", error);
  }
};

onMounted(() => {
  getUserInfo();
});
</script>

<template>
  <UApp>
    <div class="app">
      <DefaultDefaultLayout/>
      <GlobalSearch/>
      <LoginDialogDialog/>
      <Toaster/>
    </div>
  </UApp>
  <!-- <v-app>
    
  </v-app> -->
</template>
