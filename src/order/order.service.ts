import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/create-order.dto';

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
}
