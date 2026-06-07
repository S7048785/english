import { Module } from "@nestjs/common";
import { AlipayService } from "./pay.service";

@Module({
  providers: [AlipayService],
  exports: [AlipayService],
})
export class AlipayModule {}
