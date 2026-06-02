import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, Prisma } from '../generated/prisma/client';
import { QrCodeUtil } from 'src/common/utils/qrcode.util';

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly qrCodeUtil: QrCodeUtil,
  ) {}

  async findById(orderId: string) {
    return this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        merchant: true,
        user: true,
        orderItems: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prismaService.order.findMany({
      where: { userId },
      include: {
        merchant: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByMerchantId(merchantId: string) {
    return this.prismaService.order.findMany({
      where: { merchantId },
      include: {
        user: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    userId: string,
    merchantId: string,
    notes: string | undefined,
    orderItems: { surplusItemId: string; quantity: number }[],
  ) {
    return this.prismaService.$transaction(async (prisma) => {
      let totalAmount = 0;
      let totalOriginal = 0;
      const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const item of orderItems) {
        const surplusItem = await prisma.surplusItem.findUnique({
          where: { id: item.surplusItemId },
          include: { menuItem: true },
        });

        if (!surplusItem || !surplusItem.isActive) {
          throw new BadRequestException(`Item ${item.surplusItemId} is not available`);
        }
        if (surplusItem.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${surplusItem.menuItem.name}`);
        }

        await prisma.surplusItem.update({
          where: { id: surplusItem.id },
          data: { stock: surplusItem.stock - item.quantity },
        });

        totalAmount += surplusItem.discountPrice * item.quantity;
        totalOriginal += surplusItem.originalPrice * item.quantity;

        orderItemsData.push({
          surplusItemId: surplusItem.id,
          name: surplusItem.menuItem.name,
          quantity: item.quantity,
          discountPrice: surplusItem.discountPrice,
          originalPrice: surplusItem.originalPrice,
        });
      }

      const expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() + 15);

      const order = await prisma.order.create({
        data: {
          userId,
          merchantId,
          totalAmount,
          totalOriginal,
          notes,
          expiredAt,
          qrCode: '',
          orderItems: {
            createMany: { data: orderItemsData },
          },
        },
        include: { orderItems: true },
      });

      const qrCode = await this.qrCodeUtil.generateToken(order.id);

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          qrCode: qrCode,
        },
        include: { orderItems: true },
      });

      return updatedOrder;
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, paidAt?: Date) {
    return this.prismaService.order.update({
      where: { id: orderId },
      data: {
        status,
        paidAt: paidAt,
      },
      include: { orderItems: true },
    });
  }
}
