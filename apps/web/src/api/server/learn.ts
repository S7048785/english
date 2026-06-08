import {serverInstance} from "@/api";
import type {Word} from "@en/common/word";
import type {Result} from "@en/common/response.ts";

// 获取课程学习单词列表（最多10个未学单词）
export const getLearnWordList = (courseId: string): Result<Word[]> => {
  return serverInstance.get(`/learn/${courseId}`);
};

// 批量标记单词已掌握
export const markWordsMastered = (wordIds: string[]): Result<number> => {
  return serverInstance.post("/learn", {wordIds});
};
