import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { merchantId, items } = createOrderDto;

    // 1. Cek apakah Merchant-nya valid dan ada di database
    const merchant = await this.ordersRepository.findMerchantById(merchantId);

    if (!merchant) {
      throw new NotFoundException('Toko tidak ditemukan.');
    }

    // 2. Ambil semua ID surplusItem dari keranjang yang dikirim Flutter
    const surplusItemIds = items.map((item) => item.surplusItemId);

    // 3. Tarik data makanan-makanan tersebut dari database
    const surplusItemsDB = await this.ordersRepository.findActiveSurplusItems(merchantId, surplusItemIds);

    // 4. Cek apakah ada barang selundupan (dikirim ID-nya dari frontend, tapi di DB nggak ada)
    if (surplusItemsDB.length !== items.length) {
      throw new BadRequestException('Beberapa item dalam keranjang tidak valid atau sudah ditarik oleh toko.');
    }

    // 5. Validasi Stok: Cocokkan jumlah yang mau dibeli dengan sisa stok di database
    for (const orderItem of items) {
      // Cari data asli dari database untuk item ini
      const dbItem = surplusItemsDB.find((db) => db.id === orderItem.surplusItemId);

      if (!dbItem) {
        throw new BadRequestException('The item is not Exist.');
      }
      // Hitung stok yang benar-benar bisa dibeli (Total - yang udah di-booking orang)
      const availableStock = dbItem.stock;

      if (orderItem.quantity > availableStock) {
        throw new BadRequestException(`Stok untuk makanan ini tidak mencukupi. Sisa stok: ${availableStock}`);
      }
    }

    let totalAmount = 0;
    let totalOriginal = 0;
    const orderItemsToCreate: any[] = [];

    for (const orderItem of items) {
      const dbItem = surplusItemsDB.find((db) => db.id === orderItem.surplusItemId)!;

      totalAmount += orderItem.quantity * dbItem.discountPrice;
      totalOriginal += orderItem.quantity * dbItem.originalPrice;

      orderItemsToCreate.push({
        surplusItemId: dbItem.id,
        quantity: orderItem.quantity,
        name: dbItem.menuItem.name,

        discountPrice: dbItem.discountPrice,
        originalPrice: dbItem.originalPrice,
      });
    }

    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 1);

    try {
      const orderResult = await this.ordersRepository.createOrderWithStockAdjustment(
        {
          merchant: { connect: { id: merchantId } },
          status: 'PENDING',
          totalAmount,
          totalOriginal,
          expiredAt,
          user: { connect: { id: userId } },
          orderItems: {
            create: orderItemsToCreate.map((item) => ({
              surplusItemId: item.surplusItemId,
              name: item.name,
              quantity: item.quantity,
              discountPrice: item.discountPrice,
              originalPrice: item.originalPrice,
            })),
          },
        },
        orderItemsToCreate,
      );

      return orderResult;
    } catch (error) {
      throw new BadRequestException('Gagal membuat pesanan. Silakan coba lagi.');
    }
  }
}
