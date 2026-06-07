import { serverInstance } from "@/api";
import type { Course } from "@en/common/course";
import type { Result, Data } from "@en/common/response.ts";

export const getCourseList = (): Result<Course[]> => {
  return serverInstance.get("/course/list");
};

export const getPurchasedCourseList = (): Result<Course[]> => {
  return serverInstance.get("/pay/purchased-courses");
};
