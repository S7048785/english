import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorkBookService } from './work-book.service';
import { WordQueryDto } from './dto';


@Controller('word-book')
export class WorkBookController {
  constructor(private readonly workBookService: WorkBookService) {}

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
