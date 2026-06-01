import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './utils/crypto.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MinioModule } from './minio/minio.module';
import { PayModule } from './pay/pay.module';

@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService, PrismaModule, CryptoModule, JwtModule, ConfigModule, MinioModule, PayModule],
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
    MinioModule,
    PayModule,
  ],
})
export class SharedModule {}
