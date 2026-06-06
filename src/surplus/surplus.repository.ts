import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class SurplusRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllByMerchantId(merchantId: string) {
    return this.prismaService.surplusItem.findMany({
      where: { merchantId },
      include: {
        menuItem: {
          select: {
            name: true,
            description: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.SurplusItemCreateInput) {
    return this.prismaService.surplusItem.create({
      data,
      include: {
        menuItem: {
          select: {
            name: true,
            description: true,
            image: true,
          },
        },
      },
    });
  }

  async findById(surplusItemId: string) {
    return this.prismaService.surplusItem.findUnique({
      where: { id: surplusItemId },
    });
  }

  async update(surplusItemId: string, data: Prisma.SurplusItemUpdateInput) {
    return this.prismaService.surplusItem.update({
      where: { id: surplusItemId },
      data,
      select: {
        id: true,
        discountPrice: true,
        stock: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}