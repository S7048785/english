import { createZodDto } from 'nestjs-zod';
import { UserLoginSchema, UserRegisterSchema, UserUpdateSchema } from '@en/common/user';

export class UserLoginDto extends createZodDto(UserLoginSchema) {}

export class UserRegisterDto extends createZodDto(UserRegisterSchema) {}

export class UserUpdateDto extends createZodDto(UserUpdateSchema) {}