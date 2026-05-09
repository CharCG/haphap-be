import { Injectable, NotFoundException } from '@nestjs/common';
import { MerchantRepository } from './merchant.repository';
import { GetMerchantsQueryDto } from './dto/get-merchants-query.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantService {
  constructor(private readonly merchantRepository: MerchantRepository) {}

  async findAll(dto: GetMerchantsQueryDto) {
    const merchants = await this.merchantRepository.findAll(
      dto.search,
      dto.categories,
    );

    return merchants.map((m) => ({
      merchantId: m.id,
      merchantName: m.merchantName,
      address: m.address,
      description: m.description,
      openTime: m.openTime,
      closeTime: m.closeTime,
      avatar: m.avatar,
      categories: m.categories,
      rating: m.rating,
    }));
  }

  async findOne(id: string) {
    const merchant = await this.merchantRepository.findByIdWithSurplus(id);

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      merchantId: merchant.id,
      merchantName: merchant.merchantName,
      address: merchant.address,
      latitude: merchant.latitude,
      longitude: merchant.longitude,
      description: merchant.description,
      openTime: merchant.openTime,
      closeTime: merchant.closeTime,
      phone: merchant.phone,
      avatar: merchant.avatar,
      categories: merchant.categories,
      rating: merchant.rating,
      surplusItems: merchant.surplusItems.map((i) => ({
        surplusItemId: i.id,
        name: i.menuItem.name,
        description: i.menuItem.description,
        image: i.menuItem.image,
        discountPrice: i.discountPrice,
        originalPrice: i.originalPrice,
        stock: i.stock,
      })),
    };
  }

  async findReviews(merchantId: string) {
    const reviews =
      await this.merchantRepository.findReviewsByMerchantId(merchantId);
    return reviews.map((r) => ({
      reviewId: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      customerName: r.user.name,
      customerAvatar: r.user.avatar,
    }));
  }

  async findMe(userId: string) {
    const merchant = await this.merchantRepository.findByUserId(userId);

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found for this user');
    }

    return {
      merchantId: merchant.id,
      merchantName: merchant.merchantName,
      address: merchant.address,
      latitude: merchant.latitude,
      longitude: merchant.longitude,
      description: merchant.description,
      openTime: merchant.openTime,
      closeTime: merchant.closeTime,
      phone: merchant.phone,
      avatar: merchant.avatar,
      categories: merchant.categories,
      rating: merchant.rating,
      totalRevenue: merchant.totalRevenue,
      totalPortion: merchant.totalPortion,
    };
  }

  async updateMe(userId: string, dto: UpdateMerchantDto) {
    const merchant = await this.merchantRepository.findByUserId(userId);

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found for this user');
    }

    const updated = await this.merchantRepository.update(merchant.id, dto);

    return {
      merchantId: updated.id,
      description: updated.description,
      openTime: updated.openTime,
      closeTime: updated.closeTime,
      avatar: updated.avatar,
      categories: updated.categories,
      updatedAt: updated.updatedAt,
    };
  }
}
