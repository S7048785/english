<script setup lang="ts">
import { ref } from 'vue';
import { z } from "zod"

const dialog = ref(false)
</script>

<template>
  <div class="about">
    <h1 class="bg-red-500 dark:bg-blue-400">This is an about page</h1>

    <div class="text-center pa-4">
      <v-btn @click="dialog = true" class="bg-red-500">
        Open Dialogaaa
      </v-btn>

      <v-dialog v-model="dialog" width="auto">
        <v-card max-width="400" prepend-icon="mdi-update"
          text="Your application will relaunch automatically after the update is complete." title="Update in progress">
          <template v-slot:actions>
            <v-btn class="ms-auto" text="Ok" @click="dialog = false"></v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
