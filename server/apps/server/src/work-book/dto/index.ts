import { WordQuerySchema } from '@en/common/word';
import { createZodDto } from 'nestjs-zod';

export class WordQueryDto extends createZodDto(WordQuerySchema) {}