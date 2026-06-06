import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { MidtransService } from './midtrans.service';
import { OrderStatus, PaymentStatus } from '../generated/prisma/enums';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly midtransService: MidtransService,
    private readonly prismaService: PrismaService,
  ) { }

  private resolvePaymentStatus(transactionStatus: string, fraudStatus: string): PaymentStatus {
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      return fraudStatus === 'accept' || !fraudStatus ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    } else if (['cancel', 'deny', 'failure'].includes(transactionStatus)) {
      return PaymentStatus.FAILED;
    } else if (transactionStatus === 'expire') {
      return PaymentStatus.EXPIRED;
    }

    return PaymentStatus.PENDING;
  }

  async createPayment(userId: string, orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order is already ${order.status}`);
    }

    const existingPayment = await this.prismaService.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.PENDING) {
      throw new BadRequestException('Payment for this order already exists');
    }

    const payment = await this.prismaService.payment.upsert({
      where: { orderId },
      create: {
        order: { connect: { id: orderId } },
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
      },
      update: {
        transactionId: null,
        status: PaymentStatus.PENDING,
      },
    });

    const { token, redirectUrl } = await this.midtransService.createTransaction({
      orderId,
      grossAmount: order.totalAmount,
      customerName: order.user.name,
      customerEmail: order.user.email,
      customerPhone: order.user.phone,
    });

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      snapToken: token,
      redirectUrl,
      createdAt: payment.createdAt,
    };
  }

  async handleWebhook(dto: MidtransWebhookDto) {
    const isWebhookValid = await this.midtransService.verifyWebhookSignature(dto);

    if (!isWebhookValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const { order_id, transaction_id, transaction_status, fraud_status } = dto;
    const paymentStatus = this.resolvePaymentStatus(transaction_status, fraud_status);

    const payment = await this.prismaService.payment.findUnique({
      where: { orderId: order_id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    let orderStatus;

    if (paymentStatus === PaymentStatus.SUCCESS) {
      orderStatus = OrderStatus.PAID;
    } else if (paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.EXPIRED) {
      orderStatus = OrderStatus.CANCELLED;
    }

    const updatedPayment = await this.prismaService.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        ...(transaction_id && { transactionId: transaction_id }),
      },
    });

    if (orderStatus) {
      const updatedOrder = await this.prismaService.order.update({
        where: { id: order_id },
        data: {
          status: orderStatus,
          ...(orderStatus === OrderStatus.PAID && { paidAt: new Date() }),
        },
      });
    }

    return { received: true };
  }
}
