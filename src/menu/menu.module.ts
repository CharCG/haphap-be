import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller.js';
import { MenuService } from './menu.service.js';
import { StorageModule } from '../storage/storage.module.js';
import { MerchantModule } from '../merchant/merchant.module.js';

@Module({
  imports: [StorageModule, MerchantModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
