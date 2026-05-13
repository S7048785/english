import { serverInstance } from "@/api";
import type { Word, WordList, WordQueryDto } from '@en/common';
import {type Result} from "@en/common";

/** 获取单词列表 */
export function getWordList(params: WordQueryDto): Result<WordList> {
  return serverInstance.get("/word-book", { params });
}

/** 获取单个单词 */
export function getWord(id: string): Result<Word> {
  return serverInstance.get(`/word-book/${id}`);
}