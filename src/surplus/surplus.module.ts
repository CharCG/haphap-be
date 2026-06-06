import { Module } from '@nestjs/common';
import { SurplusController } from './surplus.controller';
import { SurplusService } from './surplus.service';

@Module({
  controllers: [SurplusController],
  providers: [SurplusService],
  exports: [SurplusService],
})
export class SurplusModule {}
