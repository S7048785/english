import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';

@Injectable()
export class LearnService {
  constructor(private readonly prisma: PrismaService) {}

  // 保存单词到wordbook-record
  async saveBatchWord(wordIds: string[], userId: string) {
    if (wordIds.length === 0) return;
    // 封装为对象
    const wordObjects = wordIds.map((wordId) => ({
      userId,
      wordId,
      isMaster: true,
    }));
    const { wordNumber } = await this.prisma.$transaction(async (tx) => {
      // 创建单词记录 返回实际创建数量
      const { count } = await tx.wordBookRecord.createMany({
        data: wordObjects,
        skipDuplicates: true, // 跳过重复数据
      });
      // 更新用户的单词数量
      return tx.user.update({
        where: { id: userId },
        data: { wordCount: { increment: count } },
      });
    });
    // 返回用户总的单词数量
    return wordNumber;
  }

  async getWordList(courseId: string, userId: string) {
    const existsCourse = await this.isPay(courseId, userId);
    // 获取课程类型
    const courseType = existsCourse.course.value;
    // 查询 10 条单词
    return this.prisma.wordBook.findMany({
      where: {
        // 查询指定类型的单词列表: 'gk': true
        [courseType]: true,
        // 查询用户未学习的单词（单词记录没有该用户的学习记录）
        wordBookRecords: {
          none: {
            userId,
          },
        },
      },
      orderBy: {
        frq: 'desc', // 学习频率 倒排
      },
      // 查询前10条
      skip: 0,
      take: 10,
    });
  }

  // 查询用户是否购买过该课程
  private async isPay(courseId: string, userId: string) {
    const existsCourse = await this.prisma.courseRecord.findFirst({
      where: {
        courseId,
        userId,
        isPurchased: true,
      },
      include: {
        course: true,
      },
    });
    if (!existsCourse) {
      throw new HttpException('您未拥有该课程', 403);
    }
    return existsCourse;
  }
}
