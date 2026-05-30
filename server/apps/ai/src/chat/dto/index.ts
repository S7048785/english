import { createZodDto } from 'nestjs-zod';
import { ChatDtoSchema } from '@en/common';
export class ChatDto extends createZodDto(ChatDtoSchema) {}