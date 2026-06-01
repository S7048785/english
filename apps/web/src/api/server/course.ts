import {serverInstance} from "@/api";
import type {Course} from "@en/common/course";
import type {Result, Data} from "@en/common/response.ts";

export const getCourseList = (): Result<Course[]> => {
	return serverInstance.get('/course/list')
}

export const getPurchasedCourseList = async (): Result<Course[]> => {
	// TODO: 替换为真实 API
	return {
		data: [],
		timestamp: new Date().toISOString(),
		path: '/course/purchased',
		message: 'success',
		code: 200,
		success: true
	}
	// return serverInstance.get('/course/purchased')
}