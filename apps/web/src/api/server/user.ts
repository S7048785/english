import { serverInstance } from "@/api";
import { type AvatarResult, type UserLogin, type UserRegister, type UserWebResult } from '@en/common';
import type { Result, UserResult, UserUpdate } from "@en/common";

export const login = (data: UserLogin): Result<UserWebResult> => serverInstance.post("/user/login", data);

export const register = (data: UserRegister): Result<UserWebResult> => serverInstance.post("/user/register", data);

export const getPublicKey = (): Result<string> => serverInstance.get("/user/public-key");

export const logout = () => serverInstance.post("/user/logout");

// export const uploadAvatar = (file): Result<AvatarResult> => serverInstance.post("/user/upload-avatar", file);
// 使用 FormData 上传文件
export const uploadAvatar = async (file: FormData): Result<AvatarResult> => {
  return serverInstance.post('/user/upload-avatar', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
};
export const userUpdate = (data: UserUpdate): Result<UserUpdate> => serverInstance.put("/user", data);

export const getUserInfo = (): Result<UserResult> => serverInstance.get("/user");