import {z} from "zod";

const coerceBoolean = z.preprocess((val) => {
	if (typeof val === 'string') {
		if (val.toLowerCase() === 'true') return true;
		if (val.toLowerCase() === 'false') return false;
	}
	return val;
}, z.boolean().optional());

export const WordQueryDto = z.object({
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

export const wordItemSchema = z.object({
	id: z.string(),
	word: z.string(),
	phonetic: z.string().nullable(),
	definition: z.string().nullable(),
	translation: z.string().nullable(),
	pos: z.string().nullable(),
	collins: z.string().nullable(),
	oxford: z.string().nullable(),
	tag: z.string().nullable(),
	bnc: z.string().nullable(),
	frq: z.string().nullable(),
	exchange: z.string().nullable(),
	gk: z.boolean().nullable(),
	zk: z.boolean().nullable(),
	gre: z.boolean().nullable(),
	toefl: z.boolean().nullable(),
	ielts: z.boolean().nullable(),
	cet6: z.boolean().nullable(),
	cet4: z.boolean().nullable(),
	ky: z.boolean().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});


export type WordQueryDto = z.output<typeof WordQueryDto>