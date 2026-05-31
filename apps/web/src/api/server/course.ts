import {serverInstance} from "@/api";
import type {Course} from "@en/common/course";
import type {Result} from "@en/common/response.ts";

export const getCourseList = (): Result<Course[]> => {
	return serverInstance.get('/course/list')
}