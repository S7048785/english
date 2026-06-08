<script setup lang="ts">
import {ref, computed, watch, onMounted, nextTick} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useLearn} from "@/composables/business";

definePage({
  meta: {requiresAuth: true},
  name: "learn"
});

// 路由参数
const route = useRoute();
const router = useRouter();
const courseId = computed(() => route.params.courseId as string);
const courseTitle = computed(() => (route.query.title as string) || "课程学习");

// 学习 Hook
const {
  words,
  currentIndex,
  currentWord,
  isLoading,
  isBlur,
  showGroupCompleteModal,
  error,
  canGoNext,
  canGoPrev,
  fetchWords,
  nextWord,
  prevWord,
  toggleBlur,
  markCurrentMastered,
  submitMastered,
  continueLearning,
  playAudio,
} = useLearn();

// 字符输入相关
const wordChars = computed(() => currentWord.value?.word.split("") || []);
const userInput = ref<string[]>([]);
const inputRefs = ref<HTMLInputElement[]>([]);

// 监听单词变化，重置输入并聚焦第一个输入框
watch(currentWord, () => {
  userInput.value = new Array(wordChars.value.length).fill("");
  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
});

// 获取输入框边框样式
const getInputClass = (index: number) => {
  const value = userInput.value[index];
  if (!value) return "border-gray-300 dark:border-gray-600";
  if (value.toLowerCase() === wordChars.value[index]?.toLowerCase()) {
    return "border-green-500 bg-green-50 dark:bg-green-900/20";
  }
  return "border-red-500 bg-red-50 dark:bg-red-900/20";
};

// 检查是否全部拼写正确
const isAllCorrect = computed(() => {
  return (
      wordChars.value.length > 0 &&
      wordChars.value.every(
          (char, i) => userInput.value[i]?.toLowerCase() === char.toLowerCase()
      )
  );
});

// 处理输入（自动跳转下一个）
const handleInput = (index: number) => {
  if (userInput.value[index] && index < wordChars.value.length - 1) {
    inputRefs.value[index + 1]?.focus();
  }
};

// 处理退格（自动跳转上一个）
const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace" && !userInput.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
  if (event.key === "Enter" && isAllCorrect.value) {
    handleNext();
  }
};

// 处理"下一个"按钮点击
const handleNext = () => {
  toggleBlur(true);
  nextTick(() => {
    if (isAllCorrect.value) {
      markCurrentMastered();
      if (canGoNext.value) {
        nextWord();
      } else {
        // 10个单词完成，提交并显示模态框
        submitMastered(courseId.value);
      }
    }
  });
};

// 返回课程列表
const handleGoBack = () => {
  showGroupCompleteModal.value = false;
  router.push("/courses");
};

// 继续学习下一组
const handleContinue = () => {
  continueLearning(courseId.value);
};

// 页面加载时获取单词
onMounted(() => {
  fetchWords(courseId.value);
});
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center py-8 px-4">
    <!-- 课程标题 -->
    <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
      {{ courseTitle }}
    </h1>
    <p class="text-zinc-500 dark:text-zinc-400 mb-8">请根据释义和翻译拼写单词</p>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-zinc-400">加载中...</div>
    </div>

    <!-- 错误状态 - 复用 404 页面布局 -->
    <div
        v-else-if="error"
        class="min-h-[80vh] flex flex-col items-center justify-center px-4"
    >
      <h1 class="text-8xl font-bold text-zinc-200 dark:text-zinc-700 mb-4">404</h1>
      <p class="text-zinc-500 dark:text-zinc-400 mb-8">页面不存在</p>
      <UButton label="返回课程列表" to="/courses"/>
    </div>

    <!-- 学习内容 -->
    <div v-else-if="currentWord" class="w-full max-w-2xl">
      <!-- 进度 -->
      <div class="text-zinc-500 dark:text-zinc-400 mb-4">
        第 {{ currentIndex + 1 }} / {{ words.length }} 个
      </div>

      <!-- 主卡片 -->
      <div
          class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6"
      >
        <!-- 单词 + 模糊按钮 -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1 text-center">
            <div
                :class="[
                'text-4xl font-bold text-purple-600 transition-all duration-300',
                {'blur-sm': isBlur},
              ]"
            >
              {{ currentWord.word }}
            </div>
            <div class="flex items-center justify-center gap-2 mt-3">
              <span class="text-zinc-500 dark:text-zinc-400">{{
                  currentWord.phonetic
                }}</span>
              <UButton
                  icon="i-lucide-volume-2"
                  variant="ghost"
                  size="sm"
                  @click="playAudio(currentWord.word)"
              />
            </div>
          </div>
          <UButton
              :icon="isBlur ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              variant="ghost"
              size="sm"
              @click="toggleBlur(!isBlur)"
          />
        </div>

        <!-- 释义 -->
        <div
            v-if="currentWord.definition"
            class="bg-zinc-100 dark:bg-zinc-700/50 rounded-xl p-4 mb-4"
        >
          <div class="text-zinc-500 dark:text-zinc-400 text-sm mb-1">释义：</div>
          <div class="text-zinc-700 dark:text-zinc-300">
            {{ currentWord.definition }}
          </div>
        </div>

        <!-- 翻译 -->
        <div
            v-if="currentWord.translation"
            class="bg-zinc-100 dark:bg-zinc-700/50 rounded-xl p-4 mb-4"
        >
          <div class="text-zinc-500 dark:text-zinc-400 text-sm mb-1">翻译：</div>
          <div class="text-zinc-700 dark:text-zinc-300">
            {{ currentWord.translation }}
          </div>
        </div>

        <!-- 拼写区域 -->
        <div class="bg-zinc-100 dark:bg-zinc-700/50 rounded-xl p-4 mb-6">
          <div class="text-zinc-500 dark:text-zinc-400 text-sm mb-3">拼写：</div>
          <div class="flex gap-2 justify-center flex-wrap">
            <input
                v-for="(char, index) in wordChars"
                :key="index"
                :ref="(el) => { if (el) inputRefs[index] = el as HTMLInputElement }"
                v-model="userInput[index]"
                :class="[
                'w-10 h-12 text-center text-lg font-mono border-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                getInputClass(index),
              ]"
                maxlength="1"
                @input="handleInput(index)"
                @keydown="handleKeydown(index, $event)"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-3">
          <UButton
              label="上一个"
              variant="outline"
              :disabled="!canGoPrev"
              @click="prevWord"
          />
          <UButton
              label="下一个"
              :disabled="!isAllCorrect"
              @click="handleNext"
          />
        </div>
      </div>
    </div>

    <!-- 无单词提示 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-zinc-400 mb-4">暂无单词</div>
        <UButton label="返回课程列表" to="/courses"/>
      </div>
    </div>

    <!-- 完成本组模态框 -->
    <UModal v-model:open="showGroupCompleteModal" title="学习完成">
      <template #body>
        <p class="text-center text-zinc-600 dark:text-zinc-300">
          本组10个单词已学完，是否进行下一组？
        </p>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <UButton label="下次吧" variant="outline" @click="handleGoBack"/>
          <UButton label="再来一组" @click="handleContinue"/>
        </div>
      </template>
    </UModal>
  </div>
</template>
