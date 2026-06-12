import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './utils/crypto.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MinioModule } from './minio/minio.module';
import { AlipayModule } from './pay/pay.module';
import { EmailModule } from './email/email.module';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  providers: [SharedService],
  exports: [
    SharedService,
    PrismaModule,
    CryptoModule,
    JwtModule,
    ConfigModule,
    MinioModule,
    AlipayModule,
    EmailModule,
  ],
  imports: [
    PrismaModule,
    CryptoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'), //秘钥
        signOptions: { expiresIn: 10 }, //10秒过期 方便测试
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    MinioModule,
    AlipayModule,
    EmailModule,
  ],
})
export class SharedModule {}
