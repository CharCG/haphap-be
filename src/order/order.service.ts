import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUserDto } from 'src/common/dto/current-user.dto';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.orderRepository.create(userId, dto.merchantId, dto.notes, dto.orderItems);
    return {
      orderId: order.id,
      totalAmount: order.totalAmount,
      expiredAt: order.expiredAt,
    };
  }

  async findOrderById(orderId: string, currentUser: CurrentUserDto) {
    const order = await this.orderRepository.findById(orderId);
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
    return this.orderRepository.findByUserId(userId);
  }

  async findOrderMerchant(merchantId: string) {
    return this.orderRepository.findByMerchantId(merchantId);
  }

  async scanOrder(orderId: string, merchantId: string, qrCode: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    } else if (order.merchant.userId !== merchantId) {
      throw new ForbiddenException('You are not authorized to scan this order');
    } else if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in a valid state to be scanned');
    } else if (order.qrCode !== qrCode) {
      throw new BadRequestException('Invalid QR code');
    }

    return await this.orderRepository.updateOrderStatus(orderId, 'COMPLETED', new Date());
  }
}
