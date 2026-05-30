import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import {Config} from "@en/config"
import { InterceptorInterceptor } from 'libs/shared/src/interceptor/interceptor';
import { InterceptorExceptionFilter } from 'libs/shared/src/interceptor/exceptionFilter';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalFilters(new InterceptorExceptionFilter())
  app.useGlobalInterceptors(new InterceptorInterceptor())
  // 设置全局前缀为 ai
  app.setGlobalPrefix('ai');
  // 启用版本控制，使用 URI 版本，默认版本为 v1
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  await app.listen(Config.ports.ai);
}
bootstrap();
