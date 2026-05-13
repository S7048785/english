import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiRes } from 'libs/shared/src';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return ApiRes.ok(this.appService.getHello());
  }
}
