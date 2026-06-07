import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Config } from '@en/config';
import { InterceptorExceptionFilter } from 'libs/shared/src/interceptor/exceptionFilter';
import { InterceptorInterceptor } from 'libs/shared/src/interceptor/interceptor';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new InterceptorExceptionFilter());
  app.useGlobalInterceptors(new InterceptorInterceptor());
  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true,
  //   transformOptions: {
  //     enableImplicitConversion: true, // 核心：开启隐式转换
  //   },
  // }));
  app.use(cookieParser());
  // 设置全局前缀为 api
  app.setGlobalPrefix('api');
  // 启用版本控制，使用 URI 版本，默认版本为 v1
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  await app.listen(Config.ports.server);
}

bootstrap();
