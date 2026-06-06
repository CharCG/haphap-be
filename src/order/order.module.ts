import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QrCodeUtil } from 'src/common/utils/qrcode.util';

@Module({
  controllers: [OrderController],
  providers: [OrderService, QrCodeUtil],
  exports: [OrderService],
})
export class OrderModule {}
