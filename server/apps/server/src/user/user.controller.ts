import { ApiRes } from '@libs/shared';
import { Controller, Post, Body, Get, Req, Res, Put, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserLoginDto, UserRegisterDto, UserUpdateDto } from './dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Express, Request, Response } from 'express';
import { UserWebResult } from '@en/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  private cachedPublicKey: string | null = null;
  private lastLoadTime = 0;
  private readonly CACHE_DURATION = 300000; // 5分钟

  @Post('login')
  async login(@Body() user: UserLoginDto, @Res({ passthrough: true }) res: Response): Promise<ApiRes<UserWebResult>> {
    const userRes = await this.userService.login(user);
    this.setToken(userRes.token.refreshToken, res)
    return ApiRes.ok({
      user: userRes.user,
      token: userRes.token.accessToken,
    });
  }

  @Post('register')
  async register(@Body() user: UserRegisterDto, @Res({ passthrough: true }) res: Response): Promise<ApiRes<UserWebResult>> {
    const userRes = await this.userService.register(user)
   this.setToken(userRes.token.refreshToken, res)
    return ApiRes.ok({
      user: userRes.user,
      token: userRes.token.accessToken,
    });
  }

  @Post('logout')
  logout(@Req() request: Request, @Res({ passthrough: true }) res: Response) {
    this.removeToken( res)
  }

  @Get('public-key')
  async getPublicKey() {
    const now = Date.now();

    // 缓存有效期内直接返回
    if (this.cachedPublicKey && (now - this.lastLoadTime) < this.CACHE_DURATION) {
      return this.cachedPublicKey;
    }

    // 重新加载并缓存
    const keyPath = path.join(process.cwd(), 'rsa_key', 'public.pem');
    const pemContent = await fs.readFile(keyPath, 'utf8');
    this.cachedPublicKey = pemContent.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '');
    this.lastLoadTime = now;

    return this.cachedPublicKey;
  }

  @Post('refresh-token')
  refreshToken(@Req() request: Request,  @Res({ passthrough: true }) res: Response) {
    const token = request.cookies['refresh_token'];
    try {
      const newToken = this.userService.refreshToken(token);
      // 设置 httpOnly cookie
      newToken.refreshToken && this.setToken(newToken.refreshToken, res)
      return newToken.accessToken;
    } catch(e) {
      // 删除旧refreshToken
      this.removeToken( res)
      throw e;
    }
  }

  @UseInterceptors(FileInterceptor('file')) // 限制前端的key必须是file
  @Post('upload-avatar')
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return await this.userService.uploadAvatar(file);
  }

  @UseGuards(AuthGuard)
  @Put()
  async update(@Body() user: UserUpdateDto, @Req() request: Request) {
    return await this.userService.update(user, request.user);
    // const userRes = await this.userService.update(user, request.user);
    // return {
    //   user: userRes.user,
    //   token: userRes.token.accessToken,
    // };
  }

  @UseGuards(AuthGuard)
  @Get()
  async getUserInfo(@Req() request: Request) {
    const userId = request.user.userId;
    const userInfo = await this.userService.getUserInfo(userId);
    return userInfo;
  }

  setToken(token: string, res: Response) {
    res.cookie('refresh_token', token, {
      httpOnly: true,      // ✅ 防止 XSS 攻击
      secure: process.env.NODE_ENV === 'production', // HTTPS only（生产环境）
      sameSite: 'lax',   // 防止 CSRF 攻击
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天（毫秒）
      path: '/',           // cookie 生效路径
    });
  }
  removeToken( res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}
