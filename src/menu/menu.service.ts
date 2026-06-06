import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getMerchantIdByUserId(userId: string): Promise<string> {
    const merchant = await this.prismaService.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found for this user');
    }

    return merchant.id;
  }

  private async validateMenuOwner(menuItemId: string, merchantId: string) {
    const menuItem = await this.prismaService.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem || !menuItem.isActive) {
      throw new NotFoundException('Menu item not found');
    }

    if (menuItem.merchantId !== merchantId) {
      throw new ForbiddenException('Access denied');
    }

    return menuItem;
  }

  async findAll(userId: string) {
    const merchantId = await this.getMerchantIdByUserId(userId);

    const items = await this.prismaService.menuItem.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      originalPrice: item.originalPrice,
      isActive: item.isActive,
    }));
  }

  async findOne(userId: string, menuItemId: string) {
    const merchantId = await this.getMerchantIdByUserId(userId);
    await this.validateMenuOwner(menuItemId, merchantId);

    const menuItem = await this.prismaService.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem || !menuItem.isActive) {
      throw new NotFoundException('Menu item not found');
    }

    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      image: menuItem.image,
      originalPrice: menuItem.originalPrice,
      isActive: menuItem.isActive,
    };
  }

  async create(userId: string, dto: CreateMenuItemDto) {
    const merchantId = await this.getMerchantIdByUserId(userId);

    const menuItem = await this.prismaService.menuItem.create({
      data: {
        ...dto,
        merchantId,
      },
    });

    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      image: menuItem.image,
      originalPrice: menuItem.originalPrice,
      isActive: menuItem.isActive,
      createdAt: menuItem.createdAt,
    };
  }

  async update(userId: string, menuItemId: string, dto: UpdateMenuItemDto) {
    const merchantId = await this.getMerchantIdByUserId(userId);
    await this.validateMenuOwner(menuItemId, merchantId);

    const updatedMenuItem = await this.prismaService.menuItem.update({
      where: { id: menuItemId },
      data: dto,
    });

    return {
      menuItemId: updatedMenuItem.id,
      name: updatedMenuItem.name,
      description: updatedMenuItem.description,
      image: updatedMenuItem.image,
      originalPrice: updatedMenuItem.originalPrice,
      isActive: updatedMenuItem.isActive,
      updatedAt: updatedMenuItem.updatedAt,
    };
  }

  async remove(userId: string, menuItemId: string) {
    const merchantId = await this.getMerchantIdByUserId(userId);
    await this.validateMenuOwner(menuItemId, merchantId);

    const deletedMenuItem = await this.prismaService.menuItem.update({
      where: { id: menuItemId },
      data: { isActive: false },
    });

    return {
      menuItemId: deletedMenuItem.id,
      isActive: deletedMenuItem.isActive,
      updatedAt: deletedMenuItem.updatedAt,
    };
  }
}
