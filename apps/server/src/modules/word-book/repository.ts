import { db } from "@/db"
import { wordBook } from "../../../drizzle/schema"
import { sql, ilike, eq, and, desc } from "drizzle-orm"
import type { WordQueryDto } from "./dto/query"

export class Repository {
	async findWithPagination(params: WordQueryDto) {
		const { page, pageSize, word, gk, zk, gre, toefl, ielts, cet6, cet4, ky } = params
		const offset = (page - 1) * pageSize

		const conditions = []
		if (word) conditions.push(ilike(wordBook.word, `%${word}%`))
		if (gk !== undefined) conditions.push(eq(wordBook.gk, gk))
		if (zk !== undefined) conditions.push(eq(wordBook.zk, zk))
		if (gre !== undefined) conditions.push(eq(wordBook.gre, gre))
		if (toefl !== undefined) conditions.push(eq(wordBook.toefl, toefl))
		if (ielts !== undefined) conditions.push(eq(wordBook.ielts, ielts))
		if (cet6 !== undefined) conditions.push(eq(wordBook.cet6, cet6))
		if (cet4 !== undefined) conditions.push(eq(wordBook.cet4, cet4))
		if (ky !== undefined) conditions.push(eq(wordBook.ky, ky))

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined

		const [list, countResult] = await Promise.all([
			db.select()
				.from(wordBook)
				.where(whereClause)
				.orderBy(desc(wordBook.frq))
				.limit(pageSize)
				.offset(offset),
			db.select({ count: sql<number>`count(*)` })
				.from(wordBook)
				.where(whereClause)
		])

		const count = Number(countResult[0]?.count ?? 0)

		return {
			list,
			total: count,
			page,
			pageSize,
		}
	}
}
