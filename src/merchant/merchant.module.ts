import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { MerchantRepository } from './merchant.repository';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService, MerchantRepository],
  exports: [MerchantService, MerchantRepository],
})
export class MerchantModule {}
