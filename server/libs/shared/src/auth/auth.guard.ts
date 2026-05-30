import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { RefreshTokenPayload } from '@en/common';

// 路由守卫 校验accessToken
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    if (!headers.authorization) {
      throw new UnauthorizedException('未提供授权令牌')
    }
    const token = headers.authorization.split(' ')[1];
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(token);
      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('授权令牌无效')
      }
      request.user = decoded;
    } catch (error) {
      // 保留原始错误信息，便于调试
      if (error instanceof UnauthorizedException) {
        throw error; // 直接抛出我们主动抛出的异常
      }

      // JWT 验证失败的具体错误处理
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('无效的访问令牌');
      }

      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('登录状态已过期，请重新登录');
      }
    }
    return true;
  }
}
