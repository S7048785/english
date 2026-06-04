import {z} from "zod";
import {wordItemSchema} from "./query";

export const WordBookResponseDto = z.object({
	list: z.array(wordItemSchema),
	total: z.number(),
	page: z.number(),
	pageSize: z.number(),
});
export type WordBookResponseDto = z.output<typeof WordBookResponseDto>;
