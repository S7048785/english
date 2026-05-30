import { Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Minio.Client;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT')!,
      port: this.configService.get('MINIO_PORT'),
      // 将字符串转换为布尔值
      useSSL: !!Number(this.configService.get('MINIO_USE_SSL')),
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    const bucketName = this.configService.get('MINIO_BUCKET')!;
    await this.minioClient.bucketExists(bucketName).then(async (exists) => {
      if (!exists) {
        await this.minioClient.makeBucket(bucketName);
        this.minioClient.setBucketPolicy(bucketName, JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              // 规则名，可选
              Sid: "PublicReadObjects",
              // 允许打开这个规则 Allow 允许、Deny拒绝
              Effect: 'Allow',
              // 所有人
              Principal: '*',
              // 允许浏览器获取对象
              Action: ['s3:GetObject'],
              // 允许访问avatar桶的所有资源
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        }));
      }
    });
  }

  getClient = () => this.minioClient

  getBucket = () => this.configService.get<string>('MINIO_BUCKET')!
}