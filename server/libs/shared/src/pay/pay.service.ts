import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlipaySdk } from 'alipay-sdk'
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PayService implements OnModuleInit {
  public alipaySdk: AlipaySdk;
  constructor(private readonly configService: ConfigService) { }
  async onModuleInit() {
    this.alipaySdk = new AlipaySdk({
      appId: this.configService.get<string>('ALIPAY_APP_ID')!,
      privateKey: this.configService.get<string>('ALIPAY_PRIVATE_KEY')!,
      alipayPublicKey: this.configService.get<string>('ALIPAY_PUBLIC_KEY')!,
      gateway: this.configService.get<string>('ALIPAY_GATEWAY')!,
    });
    const bizContent = {
      out_trade_no: "",
      product_code: "",
      subject: "",
      body: "",
      total_amount: "",
    }
    const html = this.alipaySdk.pageExecute("alipay.trade.page.pay", 'GET', {
      bizContent,
      returnUrl: "https://www.taobao.com"
    })
  }
  getAlipaySdk() {
    return this.alipaySdk;
  }
}