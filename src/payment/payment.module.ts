import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MidtransService } from './midtrans.service.js';
import { OrderModule } from '../order/order.module.js';

@Module({
  imports: [PrismaModule, OrderModule],
  controllers: [PaymentController],
  providers: [PaymentService, MidtransService],
  exports: [PaymentService],
})
export class PaymentModule {}
