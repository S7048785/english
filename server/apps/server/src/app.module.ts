import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { SharedModule } from "@libs/shared";
import { WorkBookModule } from "./work-book/work-book.module";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { PayModule } from "./pay/pay.module";
import { LearnModule } from './learn/learn.module';

@Module({
  imports: [ScheduleModule.forRoot(), UserModule, SharedModule, WorkBookModule, AuthModule, CourseModule, PayModule, LearnModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE, // ← 这是 NestJS 的依赖注入 token
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
