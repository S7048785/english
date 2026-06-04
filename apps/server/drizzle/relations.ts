import { relations } from "drizzle-orm/relations";
import { user, paymentRecord, courseRecord, course, wordBookRecord, wordBook } from "./schema";

export const paymentRecordRelations = relations(paymentRecord, ({one, many}) => ({
	user: one(user, {
		fields: [paymentRecord.userId],
		references: [user.id]
	}),
	courseRecords: many(courseRecord),
}));

export const userRelations = relations(user, ({many}) => ({
	paymentRecords: many(paymentRecord),
	courseRecords: many(courseRecord),
	wordBookRecords: many(wordBookRecord),
}));

export const courseRecordRelations = relations(courseRecord, ({one}) => ({
	paymentRecord: one(paymentRecord, {
		fields: [courseRecord.paymentRecordId],
		references: [paymentRecord.id]
	}),
	user: one(user, {
		fields: [courseRecord.userId],
		references: [user.id]
	}),
	course: one(course, {
		fields: [courseRecord.courseId],
		references: [course.id]
	}),
}));

export const courseRelations = relations(course, ({many}) => ({
	courseRecords: many(courseRecord),
}));

export const wordBookRecordRelations = relations(wordBookRecord, ({one}) => ({
	user: one(user, {
		fields: [wordBookRecord.userId],
		references: [user.id]
	}),
	wordBook: one(wordBook, {
		fields: [wordBookRecord.wordId],
		references: [wordBook.id]
	}),
}));

export const wordBookRelations = relations(wordBook, ({many}) => ({
	wordBookRecords: many(wordBookRecord),
}));