import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma, OrderStatus } from 'generated/prisma/client';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(orderId: string) {
    return this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        merchant: true,
        user: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prismaService.order.findMany({
      where: { userId },
      include: {
        orderItems: true,
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMerchantById(merchantId: string) {
    return this.prismaService.merchant.findUnique({
      where: { id: merchantId },
    });
  }

  async findActiveSurplusItems(merchantId: string, surplusItemIds: string[]) {
    return this.prismaService.surplusItem.findMany({
      where: {
        id: { in: surplusItemIds },
        merchantId,
        isActive: true,
      },
      include: { menuItem: true },
    });
  }

  async createOrder(orderData: Prisma.OrderCreateInput) {
    return this.prismaService.order.create({
      data: orderData,
      include: { orderItems: true },
    });
  }

  async createOrderWithStockAdjustment(
    orderData: Prisma.OrderCreateInput,
    stockAdjustments: { surplusItemId: string; quantity: number }[],
  ) {
    return this.prismaService.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: orderData,
        include: { orderItems: true },
      });

      for (const adjustment of stockAdjustments) {
        await prisma.surplusItem.update({
          where: { id: adjustment.surplusItemId },
          data: {
            stock: { decrement: adjustment.quantity },
          },
        });
      }

      return order;
    });
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    return this.prismaService.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
