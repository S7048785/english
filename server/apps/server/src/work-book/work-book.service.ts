import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import { Prisma } from 'libs/shared/src/generated/prisma/client';
import { WordQueryDto } from './dto';

@Injectable()
export class WorkBookService {
  constructor(private readonly prismaServer: PrismaService) {}

  async findAll(param: WordQueryDto) {
    console.log(param);

    const { page, pageSize, word, ...rest } = param;

    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...rest,
    };
    const [total, list] = await Promise.all([
      this.prismaServer.wordBook.count({ where }),
      this.prismaServer.wordBook.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { frq: 'desc' },
      }),
    ]);
    return { total, list } ;
  }

  findOne(id: number) {
    return `This action returns a #${id} workBook`;
  }
}
