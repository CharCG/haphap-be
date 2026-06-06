import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '../generated/prisma/client';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly midtransService: MidtransService,
    private readonly prismaService: PrismaService,
  ) {}

  async createPayment(orderId: string, userId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Unauthorized');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in PENDING status');
    }

    const existing = await this.prismaService.payment.findUnique({
      where: { orderId },
    });
    if (existing && existing.status === PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already exists for this order');
    }

    const { token, redirectUrl } = await this.midtransService.createTransaction({
      orderId: order.id,
      amount: order.totalAmount,
      customerName: order.user.name,
      customerEmail: order.user.email,
    });

    const payment = await this.prismaService.payment.create({
      data: {
        order: { connect: { id: orderId } },
        amount: order.totalAmount,
      },
    });

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      snapToken: token,
      redirectUrl,
      createdAt: payment.createdAt,
    };
  }

  async handleWebhook(dto: MidtransWebhookDto) {
    try {
      const notification = await this.midtransService.verifyWebhookSignature(dto);
      const { order_id, transaction_id, transaction_status, fraud_status } = notification;

      const payment = await this.prismaService.payment.findUnique({
        where: { orderId: order_id },
      });
      if (!payment) {
        console.warn(`Webhook ignored: Payment not found for order ID ${order_id}`);
        return { received: true };
      }

      let paymentStatus: PaymentStatus;
      let orderStatus: OrderStatus | null = null;

      if (transaction_status === 'capture' || transaction_status === 'settlement') {
        if (fraud_status === 'accept' || !fraud_status) {
          paymentStatus = PaymentStatus.SUCCESS;
          orderStatus = OrderStatus.PAID;
        } else {
          paymentStatus = PaymentStatus.FAILED;
          orderStatus = OrderStatus.CANCELLED;
        }
      } else if (['cancel', 'deny', 'failure'].includes(transaction_status)) {
        paymentStatus = PaymentStatus.FAILED;
        orderStatus = OrderStatus.CANCELLED;
      } else if (transaction_status === 'expire') {
        paymentStatus = PaymentStatus.EXPIRED;
        orderStatus = OrderStatus.CANCELLED;
      } else {
        paymentStatus = PaymentStatus.PENDING;
      }

      await this.prismaService.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          ...(transaction_id && { transactionId: transaction_id }),
        },
      });

      if (orderStatus) {
        await this.prismaService.order.update({
          where: { id: order_id },
          data: {
            status: orderStatus,
            ...(orderStatus === OrderStatus.PAID && { paidAt: new Date() }),
          },
        });
      }

      return { received: true };
    } catch (error) {
      console.error('Error handling Midtrans webhook:', error);
      // Return success response to satisfy Midtrans test pings and stop retries
      return { received: true };
    }
  }
}