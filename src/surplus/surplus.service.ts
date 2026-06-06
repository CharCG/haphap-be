import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SurplusRepository } from './surplus.repository';
import { MerchantRepository } from '../merchant/merchant.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurplusDto } from './dto/create-surplus.dto';
import { UpdateSurplusDto } from './dto/update-surplus.dto';

@Injectable()
export class SurplusService {
  constructor(
    private readonly surplusRepository: SurplusRepository,
    private readonly merchantRepository: MerchantRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async findAll(userId: string) {
    const merchant = await this.merchantRepository.findByUserId(userId);
    if (!merchant) throw new NotFoundException('Merchant profile not found');

    const items = await this.surplusRepository.findAllByMerchantId(merchant.id);

    return items.map((i) => ({
      surplusItemId: i.id,
      name: i.menuItem.name,
      description: i.menuItem.description,
      image: i.menuItem.image,
      discountPrice: i.discountPrice,
      originalPrice: i.originalPrice,
      stock: i.stock,
      isActive: i.isActive,
      date: i.date,
    }));
  }

  async create(userId: string, dto: CreateSurplusDto) {
    const merchant = await this.merchantRepository.findByUserId(userId);
    if (!merchant) throw new NotFoundException('Merchant profile not found');

    const menuItem = await this.prismaService.menuItem.findUnique({
      where: { id: dto.menuItemId },
    });

    if (!menuItem) throw new NotFoundException('Menu item not found');
    if (menuItem.merchantId !== merchant.id) {
      throw new ForbiddenException('Menu item does not belong to this merchant');
    }

    const existing = await this.prismaService.surplusItem.findFirst({
      where: {
        menuItemId: dto.menuItemId,
        merchantId: merchant.id,
        date: new Date(new Date().toDateString()),
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException('Surplus item for this menu already exists today');
    }

    const item = await this.surplusRepository.create({
      discountPrice: dto.discountPrice,
      originalPrice: menuItem.originalPrice,
      stock: dto.stock,
      date: new Date(new Date().toDateString()),
      menuItem: { connect: { id: dto.menuItemId } },
      merchant: { connect: { id: merchant.id } },
    });

    return {
      surplusItemId: item.id,
      name: item.menuItem.name,
      description: item.menuItem.description,
      image: item.menuItem.image,
      discountPrice: item.discountPrice,
      originalPrice: item.originalPrice,
      stock: item.stock,
      isActive: item.isActive,
      date: item.date,
    };
  }

  async update(userId: string, surplusItemId: string, dto: UpdateSurplusDto) {
    const merchant = await this.merchantRepository.findByUserId(userId);
    if (!merchant) throw new NotFoundException('Merchant profile not found');

    const item = await this.surplusRepository.findById(surplusItemId);
    if (!item) throw new NotFoundException('Surplus item not found');
    if (item.merchantId !== merchant.id) {
      throw new ForbiddenException('Surplus item does not belong to this merchant');
    }

    const updated = await this.surplusRepository.update(surplusItemId, dto);

    return {
      surplusItemId: updated.id,
      discountPrice: updated.discountPrice,
      stock: updated.stock,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    };
  }
}