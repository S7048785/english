// src/modules/crypto/crypto.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import path from 'path';
import * as fs from 'node:fs';

@Injectable()
export class CryptoService {
  private readonly privateKey: string;

  constructor() {
    // 从环境变量或配置中读取私钥（PEM 格式）
    const keyPath = path.join(process.cwd(), 'rsa_key', 'private.pem');
    this.privateKey = fs.readFileSync(keyPath, 'utf8');
  }

  /**
   * RSA 解密
   * @param encryptedBase64 Base64 编码的加密数据
   * @returns 解密后的字符串
   */
  async rsaDecrypt(encryptedBase64: string): Promise<string> {
    try {
      // 将 Base64 转换为 Buffer
      const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');

      // 使用私钥解密
      const decryptedBuffer = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        encryptedBuffer
      );

      return decryptedBuffer.toString('utf8');
    } catch (error) {
      throw new UnauthorizedException('RSA 解密失败');
    }
  }

  /**
   * 对密码进行 bcrypt 哈希加密
   * @param password 明文密码
   * @returns 哈希后的密码
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // 盐值轮数，推荐 10-12
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * 验证密码是否匹配
   * @param plainPassword 明文密码
   * @param hashedPassword 哈希密码
   * @returns 是否匹配
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 使用 SHA-256 哈希（另一种选择）
   * @param data 要哈希的数据
   * @returns 十六进制哈希值
   */
  sha256Hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 使用 SHA-256 加盐哈希
   * @param data 要哈希的数据
   * @param salt 盐值
   * @returns 十六进制哈希值
   */
  sha256WithSalt(data: string, salt: string): string {
    return crypto.createHash('sha256').update(data + salt).digest('hex');
  }

  /**
   * 完整的解密+哈希流程（用于登录场景）
   * @param encryptedPassword 前端传来的 RSA 加密密码
   * @returns 哈希后的密码
   */
  async decryptAndHash(encryptedPassword: string): Promise<string> {
    // 1. RSA 解密
    const plainPassword = await this.rsaDecrypt(encryptedPassword);

    // 2. 验证解密后的数据格式（可选）
    // if (!plainPassword || plainPassword.length < 6) {
    //   throw new UnauthorizedException('密码格式不正确');
    // }

    // 3. bcrypt 哈希
    return await this.hashPassword(plainPassword);
  }
}