import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenPayload, TokenPayload } from '@en/common';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // 阈值：剩余时间少于 1 天就刷新（可根据业务调整）
  private readonly refreshThreshold = 24 * 60 * 60; // 1天 = 86400秒

  generateToken(payload: TokenPayload) {
    return {
      accessToken: this.jwtService.sign<RefreshTokenPayload>({
        ...payload,
        tokenType: 'access',
      }),
      refreshToken: this.jwtService.sign<RefreshTokenPayload>(
        { ...payload, tokenType: 'refresh' },
        { expiresIn: '7d' },
      ),
    };
  }

  verifyToken(token: string) {
    const user = this.jwtService.verify<
      RefreshTokenPayload & { exp: number; iat: number }
    >(token);
    if (user.tokenType !== 'refresh') {
      throw new UnauthorizedException('refreshToken已过期或无效');
    }
    return this.refreshToken(
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      user.exp,
    );
  }

  refreshToken(payload: TokenPayload, exp: number) {
    const accessToken = this.jwtService.sign<RefreshTokenPayload>({
      ...payload,
      tokenType: 'access',
    });

    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = exp - currentTime;

    // 判断是否需要刷新 refresh token
    if (remainingTime <= this.refreshThreshold) {
      return {
        accessToken, // 访问令牌，有效期 15 分钟(已在shardModule.ts中配置)
        refreshToken: this.jwtService.sign<RefreshTokenPayload>(
          {
            ...payload,
            tokenType: 'refresh',
          },
          { expiresIn: '7d' },
        ), // 刷新令牌 7 天
      };
    } else {
      return {
        accessToken, // 访问令牌，有效期 15 分钟(已在shardModule.ts中配置)
        refreshToken: null,
      };
    }
  }
}
