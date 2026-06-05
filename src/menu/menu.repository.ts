import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class MenuRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByMerchantId(merchantId: string) {
    return this.prismaService.menuItem.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(menuItemId: string) {
    return this.prismaService.menuItem.findUnique({
      where: { id: menuItemId },
    });
  }

  async create(data: Prisma.MenuItemUncheckedCreateInput) {
    return this.prismaService.menuItem.create({ data });
  }

  async update(menuItemId: string, data: Prisma.MenuItemUpdateInput) {
    return this.prismaService.menuItem.update({
      where: { id: menuItemId },
      data,
    });
  }

  async softDelete(menuItemId: string) {
    return this.prismaService.menuItem.update({
      where: { id: menuItemId },
      data: { isActive: false },
    });
  }
}
