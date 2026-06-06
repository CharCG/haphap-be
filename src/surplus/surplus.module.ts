import { Module } from '@nestjs/common';
import { SurplusController } from './surplus.controller';
import { SurplusService } from './surplus.service';
import { SurplusRepository } from './surplus.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [PrismaModule, MerchantModule],
  controllers: [SurplusController],
  providers: [SurplusService, SurplusRepository],
  exports: [SurplusService],
})
export class SurplusModule {}