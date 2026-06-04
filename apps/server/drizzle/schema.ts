import { pgTable, varchar, timestamp, text, integer, index, boolean, uniqueIndex, foreignKey, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const tradeStatus = pgEnum("TradeStatus", ['NOT_PAY', 'WAIT_BUYER_PAY', 'TRADE_CLOSED', 'TRADE_SUCCESS', 'TRADE_FINISHED'])


export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const wordBook = pgTable("WordBook", {
	id: text().primaryKey().notNull(),
	word: text().notNull(),
	phonetic: text(),
	definition: text(),
	translation: text(),
	pos: text(),
	collins: text(),
	oxford: text(),
	tag: text(),
	bnc: text(),
	frq: text(),
	exchange: text(),
	gk: boolean(),
	zk: boolean(),
	gre: boolean(),
	toefl: boolean(),
	ielts: boolean(),
	cet6: boolean(),
	cet4: boolean(),
	ky: boolean(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("WordBook_tag_idx").using("btree", table.tag.asc().nullsLast().op("text_ops")),
	index("WordBook_word_idx").using("btree", table.word.asc().nullsLast().op("text_ops")),
	index("WordBook_word_tag_idx").using("btree", table.word.asc().nullsLast().op("text_ops"), table.tag.asc().nullsLast().op("text_ops")),
]);

export const paymentRecord = pgTable("PaymentRecord", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	tradeNo: text(),
	outTradeNo: text().notNull(),
	amount: numeric({ precision: 65, scale:  30 }).notNull(),
	subject: text().notNull(),
	body: text().notNull(),
	tradeStatus: tradeStatus().default('NOT_PAY').notNull(),
	sendPayTime: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("PaymentRecord_outTradeNo_key").using("btree", table.outTradeNo.asc().nullsLast().op("text_ops")),
	index("PaymentRecord_tradeNo_idx").using("btree", table.tradeNo.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "PaymentRecord_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const courseRecord = pgTable("CourseRecord", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	courseId: text().notNull(),
	isPurchased: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	paymentRecordId: text(),
}, (table) => [
	uniqueIndex("CourseRecord_userId_courseId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.courseId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.paymentRecordId],
			foreignColumns: [paymentRecord.id],
			name: "CourseRecord_paymentRecordId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "CourseRecord_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.id],
			name: "CourseRecord_courseId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const course = pgTable("Course", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	value: text().notNull(),
	description: text(),
	teacher: text().notNull(),
	url: text().notNull(),
	price: numeric({ precision: 65, scale:  30 }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
});

export const wordBookRecord = pgTable("WordBookRecord", {
	id: text().primaryKey().notNull(),
	wordId: text().notNull(),
	isMaster: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	userId: text().notNull(),
}, (table) => [
	uniqueIndex("WordBookRecord_userId_wordId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.wordId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "WordBookRecord_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.wordId],
			foreignColumns: [wordBook.id],
			name: "WordBookRecord_wordId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const user = pgTable("User", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	phone: text().notNull(),
	address: text(),
	password: text().notNull(),
	avatar: text(),
	wordNumber: integer().default(0).notNull(),
	dayNumber: integer().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	lastLoginAt: timestamp({ precision: 3, mode: 'string' }),
	bio: text(),
	isTimingTask: boolean().default(false).notNull(),
	timingTaskTime: text().default('00:00:00').notNull(),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("User_phone_key").using("btree", table.phone.asc().nullsLast().op("text_ops")),
]);
