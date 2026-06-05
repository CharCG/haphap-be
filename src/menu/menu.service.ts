import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MenuRepository } from './menu.repository';
import { MerchantRepository } from '../merchant/merchant.repository';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly merchantRepository: MerchantRepository,
  ) {}

  private async getMerchantIdByUserId(userId: string): Promise<string> {
    const merchant = await this.merchantRepository.findByUserId(userId);
    if (!merchant) {
      throw new NotFoundException('Merchant profile not found for this user');
    }
    return merchant.id;
  }

  private async validateOwnership(menuItemId: string, merchantId: string) {
    const menuItem = await this.menuRepository.findById(menuItemId);
    if (!menuItem || !menuItem.isActive) {
      throw new NotFoundException('Menu item not found');
    }
    if (menuItem.merchantId !== merchantId) {
      throw new ForbiddenException('You do not have access to this menu item');
    }
    return menuItem;
  }

  async findAll(userId: string) {
    const merchantId = await this.getMerchantIdByUserId(userId);
    const items = await this.menuRepository.findByMerchantId(merchantId);

    return items.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      originalPrice: item.originalPrice,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async create(userId: string, dto: CreateMenuItemDto) {
    const merchantId = await this.getMerchantIdByUserId(userId);

    const menuItem = await this.menuRepository.create({
      merchantId,
      name: dto.name,
      description: dto.description,
      image: dto.image,
      originalPrice: dto.originalPrice,
    });

    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      image: menuItem.image,
      originalPrice: menuItem.originalPrice,
      createdAt: menuItem.createdAt,
    };
  }

  async update(userId: string, menuItemId: string, dto: UpdateMenuItemDto) {
    const merchantId = await this.getMerchantIdByUserId(userId);
    await this.validateOwnership(menuItemId, merchantId);

    const updated = await this.menuRepository.update(menuItemId, dto);

    return {
      menuItemId: updated.id,
      name: updated.name,
      description: updated.description,
      image: updated.image,
      originalPrice: updated.originalPrice,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(userId: string, menuItemId: string) {
    const merchantId = await this.getMerchantIdByUserId(userId);
    await this.validateOwnership(menuItemId, merchantId);

    await this.menuRepository.softDelete(menuItemId);

    return { menuItemId };
  }
}
