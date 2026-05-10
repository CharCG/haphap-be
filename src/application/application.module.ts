import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from './application.repository';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationRepository],
  exports: [ApplicationService, ApplicationRepository],
})
export class ApplicationModule {}
