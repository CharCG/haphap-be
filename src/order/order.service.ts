import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUserDto } from '../common/dto/current-user.dto';
import { Role, OrderStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { QrCodeUtil } from '../common/utils/qrcode.util';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly qrCodeUtil: QrCodeUtil,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.prismaService.$transaction(async (prisma) => {
      let totalAmount = 0;
      let totalOriginal = 0;
      const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const item of dto.orderItems) {
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

      const createdOrder = await prisma.order.create({
        data: {
          userId,
          merchantId: dto.merchantId,
          totalAmount,
          totalOriginal,
          notes: dto.notes,
          expiredAt,
          qrCode: '',
          orderItems: {
            createMany: { data: orderItemsData },
          },
        },
        include: { orderItems: true },
      });

      const qrCode = await this.qrCodeUtil.generateToken(createdOrder.id);

      const updatedOrder = await prisma.order.update({
        where: { id: createdOrder.id },
        data: { qrCode },
        include: { orderItems: true },
      });

      return updatedOrder;
    });

    return {
      orderId: order.id,
      totalAmount: order.totalAmount,
      expiredAt: order.expiredAt,
      qrCode: order.qrCode,
      createdAt: order.createdAt,
    };
  }

  async findOrderById(orderId: string, currentUser: CurrentUserDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        merchant: true,
        user: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (currentUser.role === Role.CUSTOMER && order.userId !== currentUser.id) {
      throw new ForbiddenException('You are not authorized to view this order');
    }

    if (currentUser.role === Role.MERCHANT && order.merchant.userId !== currentUser.id) {
      throw new ForbiddenException('You are not authorized to view this order');
    }

    return order;
  }

  async findOrderMe(userId: string) {
    return this.prismaService.order.findMany({
      where: { userId },
      include: {
        merchant: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderMerchant(userId: string) {
    const merchant = await this.prismaService.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found');
    }

    return this.prismaService.order.findMany({
      where: { merchantId: merchant.id },
      include: {
        user: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async scanOrder(orderId: string, userId: string, qrCode: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { merchant: true, orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    } else if (order.merchant.userId !== userId) {
      throw new ForbiddenException('You are not authorized to scan this order');
    } else if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in a valid state to be scanned');
    } else if (!this.qrCodeUtil.validateToken(orderId, qrCode)) {
      throw new BadRequestException('Invalid QR code');
    }

    const updatedOrder = await this.prismaService.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        paidAt: new Date(),
      },
      include: { orderItems: true },
    });

    return updatedOrder;
  }
}
