//packages/common/course/index.ts
export interface Course {
	id: string;
	name: string;
	value: string;
	description: string;
	teacher: string;
	url: string;
	price: string;
	createdAt: string;
	updatedAt: string;
}

export type CourseList = Course[];