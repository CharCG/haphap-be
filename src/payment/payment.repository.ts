import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PaymentStatus, Prisma } from '../generated/prisma/client';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.PaymentCreateInput) {
    return this.prismaService.payment.create({ data });
  }

  async findByOrderId(orderId: string) {
    return this.prismaService.payment.findUnique({
      where: { orderId },
    });
  }

  async findByTransactionId(transactionId: string) {
    return this.prismaService.payment.findUnique({
      where: { transactionId },
    });
  }

  async updateStatus(id: string, status: PaymentStatus, transactionId?: string) {
    return this.prismaService.payment.update({
      where: { id },
      data: {
        status,
        ...(transactionId && { transactionId }),
      },
    });
  }
}