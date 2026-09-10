import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { OrderStatus } from '../generated/prisma/enums.js';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(`Order is ${order.status}`);
    }

    const existingReview = await this.prismaService.review.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingReview) {
      throw new BadRequestException('Order has already been reviewed');
    }

    const review = await this.prismaService.$transaction(async (prisma) => {
      const createdReview = await prisma.review.create({
        data: {
          ...dto,
          userId,
        },
      });

      const { _avg } = await prisma.review.aggregate({
        where: { merchantId: dto.merchantId },
        _avg: { rating: true },
      });

      await prisma.merchant.update({
        where: { id: dto.merchantId },
        data: { rating: _avg.rating ?? 0 },
      });

      return createdReview;
    });

    return {
      reviewId: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }
}
