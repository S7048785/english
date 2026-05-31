import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
@Injectable()
export class CourseService {
  constructor(private readonly prismaService: PrismaService) {}
  async findAll() {
    const list = await this.prismaService.course.findMany();
    return list.map(item => ({
      ...item,
      price: Number(item.price).toFixed(2)
    }))
  }

}
