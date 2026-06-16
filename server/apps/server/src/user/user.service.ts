import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoService, PrismaService } from '@libs/shared';
import type { UserLogin, UserRegister } from '@en/common';
import { Prisma } from '@libs/shared/generated/prisma/client';
import { AuthService } from '../auth/auth.service';
import { MinioService } from '@libs/shared/minio/minio.service';
import { UserUpdateDto } from './dto';
import type { Request } from 'express';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  bio: true,
  isTimingTask: true,
  timingTaskTime: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  wordNumber: true,
  dayNumber: true,
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {}

  async login(user: UserLogin) {
    const userDb = await this.prisma.user.findUnique({
      where: {
        phone: user.phone,
      },
    });
    if (!userDb) {
      throw new HttpException('用户名或密码错误', HttpStatus.BAD_REQUEST);
    }

    // 解密并哈希密码
    // 1. RSA 解密前端传来的密码
    const plainPassword = await this.cryptoService.rsaDecrypt(user.password);

    // 2. 验证密码（与存储的哈希比较）
    const isPasswordValid = await this.cryptoService.verifyPassword(
      plainPassword,
      userDb.password,
    );
    if (!isPasswordValid)
      throw new HttpException('用户名或密码错误', HttpStatus.BAD_REQUEST);

    const token = this.authService.generateToken({
      email: userDb.email,
      name: userDb.name,
      userId: userDb.id,
    });
    const userVo = await this.prisma.user.update({
      where: {
        id: userDb.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
      select: userSelect,
    });
    return { token, user: userVo };
  }

  async register(user: UserRegister) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        phone: user.phone,
      },
    });
    if (userExists) {
      throw new HttpException('手机号已存在', HttpStatus.BAD_REQUEST);
    }
    const newUser: Prisma.UserCreateInput = {
      phone: user.phone,
      password: await this.cryptoService.hashPassword(user.password),
      name: user.name,
      lastLoginAt: new Date(),
    };
    if (user.email) {
      const userExists = await this.prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });
      if (userExists) {
        throw new HttpException('邮箱已存在', HttpStatus.BAD_REQUEST);
      }
      newUser.email = user.email;
    }
    // 创建用户
    const userVo = await this.prisma.user.create({
      data: newUser,
      select: userSelect,
    });
    const token = this.authService.generateToken({
      email: userVo.email,
      name: userVo.name,
      userId: userVo.id,
    });
    return { token, user: userVo };
  }

  refreshToken(token: string) {
    // 校验token是否有效
    return this.authService.verifyToken(token);
  }

  async uploadAvatar(file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    if (file.size > 1024 * 1024 * 5) {
      throw new HttpException(
        'File size exceeds limit',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 获取minio客户端
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const fileName = `${year}/${month}/${Date.now()}-${file.originalname}`;
    const client = this.minioService.getClient();
    const bucket = this.minioService.getBucket();
    await client.putObject(bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    const isHttps = !!Number(this.configService.get('MINIO_USE_SSL'));
    const baseUrl = isHttps ? 'https' : 'http';
    const port = this.configService.get('MINIO_PORT');
    const databaseUrl = `/${bucket}/${fileName}`;
    const previewUrl = `${baseUrl}://${this.configService.get('MINIO_ENDPOINT')}:${port}${databaseUrl}`;
    return {
      previewUrl,
      databaseUrl,
    };
  }

  async update(userUpdateDto: UserUpdateDto, user: Request['user']) {
    return this.prisma.user.update({
      where: {
        id: user.userId,
      },
      data: {
        name: userUpdateDto.name,
        email: userUpdateDto.email,
        address: userUpdateDto.address,
        bio: userUpdateDto.bio,
        isTimingTask: userUpdateDto.isTimingTask,
        timingTaskTime: userUpdateDto.timingTaskTime,
        avatar: userUpdateDto.avatar,
      },
      select: userSelect,
    });
  }

  async getUserInfo(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userSelect,
    });
  }
}
