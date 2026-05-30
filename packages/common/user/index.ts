import {z} from "zod";

export type User = {
	id: string; // 用户ID
	name: string; // 用户名
	email: string | null; // 邮箱
	phone: string; // 手机号
	address: string | null; // 地址
	bio: string | null; // 签名
	isTimingTask: boolean; // 是否开启定时任务
	timingTaskTime: string; // 定时任务时间
	password: string; // 密码
	avatar: string | null; // 头像
	wordNumber: number; // 单词数量
	dayNumber: number; // 打卡天数
	createdAt: Date; // 创建时间
	updatedAt: Date; // 更新时间
	lastLoginAt: Date | null; // 最后登录时间
};

//更新用户信息 第七集新增类型
export type UserUpdate = Pick<User, 'name' | 'email' | 'address' | 'bio' | 'isTimingTask' | 'timingTaskTime' | 'avatar'>
export const UserUpdateSchema =  z.object({
	name: z.string(),
	email: z.email().or(z.literal('')),
	isTimingTask: z.boolean(),
	timingTaskTime: z.string(),
	address: z.string().or(z.literal('')),
	bio: z.string().or(z.literal('')),
	avatar: z.string().or(z.literal('')),
})

//头像返回的类型
export type AvatarResult = {
	previewUrl: string; // 预览URL
	databaseUrl: string; // 数据库URL
}
// export type UserLogin = Pick<User, 'phone'|'password'>
export const UserLoginSchema = z.object({
	phone: z
		.string()
		.length(11, '手机号码长度必须为11位')
		.startsWith('1', '手机号码必须以1开头'),
	password: z.string().min(6, '密码长度必须为6位及以上'),
})
export type UserLogin = z.output<typeof UserLoginSchema>

export type UserRegister = Pick<User, 'name' | 'email' | 'phone' | 'password'>
export const  UserRegisterSchema = z.object({
	phone: z
		.string()
		.length(11, '手机号码长度必须为11位')
		.startsWith('1', '手机号码必须以1开头'),
	password: z.string().min(6, '密码长度必须为6位及以上'),
	name: z.string().min(4, '用户名长度必须为4位及以上'),
	email: z.email({message: '非法邮箱格式'}).or(z.literal('')), // .or(z.literal(''))
})

// 用户信息类型，排除 password
export type UserResult = Omit<User, 'password'>
// 用户登录返回类型
export type UserWebResult = {
	user: UserResult,
	token: string,
}

export type TokenPayload = Pick<User, 'name' | 'email'> & {userId: User['id']}
export type RefreshTokenPayload = TokenPayload & { tokenType: 'access' | 'refresh' }

