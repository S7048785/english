import { Controller, Get, Param, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { WorkBookService } from './work-book.service';
import { WordQueryDto } from './dto';
import { AuthGuard } from '@libs/shared/auth/auth.guard';


@Controller('word-book')
export class WorkBookController {
  constructor(private readonly workBookService: WorkBookService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() param: WordQueryDto) {
    console.log(param);
    return (await this.workBookService.findAll(param));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workBookService.findOne(+id);
  }

}
