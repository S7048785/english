import { ref, computed } from "vue";
import type { Word } from "@en/common/word";
import { getLearnWordList, markWordsMastered } from "@/api/server/learn.ts";
import { useAudio } from "@/composables/core/useAudio.ts";
import { useUserStore } from "@/stores/user";

export const useLearn = () => {
  // 状态
  const words = ref<Word[]>([]);
  const currentIndex = ref(0);
  const isLoading = ref(false);
  const isBlur = ref(true); // 默认模糊开启
  const masteredIds = ref<string[]>([]);
  const showGroupCompleteModal = ref(false);
  const error = ref<{code: number; message: string} | null>(null);

  // Store
  const userStore = useUserStore();

  // 音频播放
  const { playAudio } = useAudio({});

  // 计算属性
  const currentWord = computed(() => words.value[currentIndex.value]);
  const canGoNext = computed(() => currentIndex.value < words.value.length - 1);
  const canGoPrev = computed(() => currentIndex.value > 0);
  const isAllCompleted = computed(
    () => currentIndex.value >= words.value.length && words.value.length > 0,
  );

  // 获取单词列表
  const fetchWords = async (courseId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getLearnWordList(courseId);
      words.value = res.data;
      currentIndex.value = 0;
      masteredIds.value = [];
    } catch (e: any) {
      error.value = {
        code: e.response?.status || 500,
        message: e.response?.data?.message || "加载失败",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // 切换到下一个单词
  const nextWord = () => {
    if (canGoNext.value) {
      currentIndex.value++;
    }
  };

  // 切换到上一个单词
  const prevWord = () => {
    if (canGoPrev.value) {
      currentIndex.value--;
    }
  };

  // 切换模糊状态
  const toggleBlur = (value?: boolean) => {
    isBlur.value = value !== undefined ? value : !isBlur.value;
  };

  // 标记当前单词为已掌握
  const markCurrentMastered = () => {
    if (currentWord.value && !masteredIds.value.includes(currentWord.value.id)) {
      masteredIds.value.push(currentWord.value.id);
    }
  };

  // 提交已掌握的单词并显示完成模态框
  const submitMastered = async (courseId: string) => {
    if (masteredIds.value.length > 0) {
      const res = await markWordsMastered(masteredIds.value);
      // 覆盖用户单词数（返回的是总数）
      if (userStore.user) {
        userStore.user.wordNumber = res.data;
      }
    }
    showGroupCompleteModal.value = true;
  };

  // 继续学习下一组
  const continueLearning = async (courseId: string) => {
    showGroupCompleteModal.value = false;
    await fetchWords(courseId);
  };

  return {
    words,
    currentIndex,
    currentWord,
    isLoading,
    isBlur,
    showGroupCompleteModal,
    error,
    canGoNext,
    canGoPrev,
    isAllCompleted,
    masteredIds,
    fetchWords,
    nextWord,
    prevWord,
    toggleBlur,
    markCurrentMastered,
    submitMastered,
    continueLearning,
    playAudio,
  };
};
