import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QrCodeUtil } from 'src/common/utils/qrcode.util';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, QrCodeUtil],
})
export class OrderModule {}
