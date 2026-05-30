import { Controller, Get} from '@nestjs/common';
import { PromptService } from './prompt.service';
import { chatModeArray } from './prompt.mode';

@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Get('list')
  findAll() {
    return chatModeArray.map(item => ({
      id: item.id,
      role: item.role,
      label: item.label,
    }))
  }

}
