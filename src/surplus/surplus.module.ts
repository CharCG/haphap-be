import { Module } from '@nestjs/common';
import { SurplusController } from './surplus.controller.js';
import { SurplusService } from './surplus.service.js';
import { MerchantModule } from '../merchant/merchant.module.js';
import { MenuModule } from '../menu/menu.module.js';

@Module({
  imports: [MerchantModule, MenuModule],
  controllers: [SurplusController],
  providers: [SurplusService],
  exports: [SurplusService],
})
export class SurplusModule {}
