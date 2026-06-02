import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { PayService } from './pay.service';
import { UpdatePayDto } from './dto/update-pay.dto';
import type { Request } from 'express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';

@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Query('id') id: string, @Req() req: Request) {
    return this.payService.create(id, req.user.userId);
  }

  @Get()
  findAll() {
    return this.payService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayDto: UpdatePayDto) {
    return this.payService.update(+id, updatePayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payService.remove(+id);
  }
}
