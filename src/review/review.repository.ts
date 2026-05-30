import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByOrderId(orderId: string) {
    return this.prismaService.review.findUnique({
      where: { orderId },
    });
  }

  async create(data: Prisma.ReviewUncheckedCreateInput) {
    return this.prismaService.review.create({
      data,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });
  }
}
