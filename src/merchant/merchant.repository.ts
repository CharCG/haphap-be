import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MerchantCategory, Prisma } from '../generated/prisma/client';

@Injectable()
export class MerchantRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(search?: string, categories?: MerchantCategory[]) {
    const where: Prisma.MerchantWhereInput = {};

    if (search) {
      where.merchantName = { contains: search, mode: 'insensitive' };
    }

    if (categories && categories.length > 0) {
      where.categories = { hasSome: categories };
    }

    return this.prismaService.merchant.findMany({
      where,
      select: {
        id: true,
        merchantName: true,
        address: true,
        description: true,
        openTime: true,
        closeTime: true,
        avatar: true,
        categories: true,
        rating: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prismaService.merchant.findUnique({
      where: { userId },
    });
  }

  async update(merchantId: string, data: Prisma.MerchantUpdateInput) {
    return this.prismaService.merchant.update({
      where: { id: merchantId },
      data,
      select: {
        id: true,
        description: true,
        openTime: true,
        closeTime: true,
        avatar: true,
        categories: true,
        updatedAt: true,
      },
    });
  }

  async findByIdWithSurplus(merchantId: string) {
    return this.prismaService.merchant.findUnique({
      where: { id: merchantId },
      include: {
        surplusItems: {
          where: { isActive: true },
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  async findReviewsByMerchantId(merchantId: string) {
    return this.prismaService.review.findMany({
      where: { id: merchantId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
