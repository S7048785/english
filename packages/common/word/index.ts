import { z } from "zod";

export type Word = {
	id: string; // 单词ID
	word: string; // 单词
	phonetic?: string; // 音标
	definition?: string; // 定义
	translation?: string; // 翻译
	pos?: string; // 词性
	collins?: string; // 柯林斯
	oxford?: string; // 牛津
	tag?: string; // 标签
	bnc?: string; // BNC 英国国家语料库
	frq?: string; // FRQ 频率
	exchange?: string; // 同义词
	gk?: boolean; // 高考
	zk?: boolean; // 中考
	gre?: boolean; // GRE
	toefl?: boolean; // TOEFL
	ielts?: boolean; // IELTS
	cet6?: boolean; // 大学英语六级
	cet4?: boolean; // 大学英语四级
	ky?: boolean; // 考研
	createdAt: string; // 创建时间, ISO 日期字符串
	updatedAt: string; // 更新时间, ISO 日期字符串
};

// 定义一个布尔值强制转换器，因为 z.coerce.boolean() 会把 "false" 转为 true
const coerceBoolean = z.preprocess((val) => {
	if (typeof val === 'string') {
		if (val.toLowerCase() === 'true') return true;
		if (val.toLowerCase() === 'false') return false;
	}
	return val;
}, z.boolean().optional());

export const WordQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(20).default(12),
	word: z.string().optional(),
	// 使用自定义转换器处理 URL 里的布尔字符串
	gk: coerceBoolean,
	zk: coerceBoolean,
	gre: coerceBoolean,
	toefl: coerceBoolean,
	ielts: coerceBoolean,
	cet6: coerceBoolean,
	cet4: coerceBoolean,
	ky: coerceBoolean,
});

export type WordList = {
	list: Word[];
	total: number;
}

