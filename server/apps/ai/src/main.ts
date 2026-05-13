import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import {Config} from "@en/config"
import { InterceptorInterceptor } from 'libs/shared/src/interceptor/interceptor';
import { InterceptorExceptionFilter } from 'libs/shared/src/interceptor/exceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalFilters(new InterceptorExceptionFilter())
    app.useGlobalInterceptors(new InterceptorInterceptor())
  await app.listen(Config.ports.ai);
}
bootstrap();
