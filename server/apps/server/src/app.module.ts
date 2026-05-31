import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SharedModule } from 'libs/shared/src';
import { WorkBookModule } from './work-book/work-book.module';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [UserModule, SharedModule, WorkBookModule, AuthModule, CourseModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_PIPE,      // ← 这是 NestJS 的依赖注入 token
    useClass: ZodValidationPipe,
  }],
})
export class AppModule {}
