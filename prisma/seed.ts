import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing data...');

  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.surplusItem.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.merchant.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding database with initial data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@haphap.com',
      name: 'Budi Santoso',
      password: hashedPassword,
      phone: '081100000000',
      role: 'ADMIN',
    },
  });

  const userCustomerSiti = await prisma.user.create({
    data: {
      email: 'siti@haphap.com',
      name: 'Siti Aminah',
      password: hashedPassword,
      phone: '081211111111',
      role: 'CUSTOMER',
      totalSaved: 45000,
      totalPortion: 3,
    },
  });

  const userCustomerAgus = await prisma.user.create({
    data: {
      email: 'agus@haphap.com',
      name: 'Agus Pratama',
      password: hashedPassword,
      phone: '081222222222',
      role: 'CUSTOMER',
    },
  });

  const userMerchantAyu = await prisma.user.create({
    data: {
      email: 'ayu@haphap.com',
      name: 'Ayu Lestari',
      password: hashedPassword,
      phone: '081233333333',
      role: 'MERCHANT',
    },
  });

  const userMerchantBambang = await prisma.user.create({
    data: {
      email: 'bambang@haphap.com',
      name: 'Bambang Pamungkas',
      password: hashedPassword,
      phone: '081244444444',
      role: 'CUSTOMER',
    },
  });

  const userMerchantCitra = await prisma.user.create({
    data: {
      email: 'citra@haphap.com',
      name: 'Citra Kirana',
      password: hashedPassword,
      phone: '081255555555',
      role: 'CUSTOMER',
    },
  });

  await prisma.application.create({
    data: {
      userId: userMerchantBambang.id,
      merchantName: 'Warung Nasi Bambang',
      status: 'PENDING',
      address: 'Jl. Merdeka No. 10, Jakarta',
      latitude: -6.2,
      longitude: 106.816666,
      description: 'Menjual aneka lauk pauk sisa hari ini',
      openTime: '08:00',
      closeTime: '20:00',
      phone: '081244444444',
      categories: ['RESTORAN'],
    },
  });

  await prisma.application.create({
    data: {
      userId: userMerchantCitra.id,
      merchantName: 'Toko Kue Citra',
      status: 'REJECTED',
      address: 'Jl. Sudirman No. 5, Jakarta',
      latitude: -6.225014,
      longitude: 106.804359,
      description: 'Kue kering dan basah',
      openTime: '09:00',
      closeTime: '17:00',
      phone: '081255555555',
      categories: ['ROTI', 'PENUTUP'],
      rejectNote: 'Foto KTP buram dan tidak terbaca jelas.',
      reviewedAt: new Date(),
    },
  });

  await prisma.application.create({
    data: {
      userId: userMerchantAyu.id,
      merchantName: 'Kedai Kopi Bu Ayu',
      status: 'APPROVED',
      address: 'Jl. Diponegoro No. 15, Bandung',
      latitude: -6.903444,
      longitude: 107.618774,
      description: 'Kopi susu gula aren dan camilan lokal',
      openTime: '10:00',
      closeTime: '22:00',
      phone: '081233333333',
      categories: ['KAFE', 'JAJANAN'],
      reviewedAt: new Date(),
    },
  });

  const merchantAyu = await prisma.merchant.create({
    data: {
      userId: userMerchantAyu.id,
      merchantName: 'Kedai Kopi Bu Ayu',
      address: 'Jl. Diponegoro No. 15, Bandung',
      latitude: -6.903444,
      longitude: 107.618774,
      description: 'Kopi susu gula aren dan camilan lokal',
      openTime: '10:00',
      closeTime: '22:00',
      phone: '081233333333',
      categories: ['KAFE', 'JAJANAN'],
      rating: 4.5,
      totalRevenue: 65000,
      totalPortion: 3,
    },
  });

  const menuKopi = await prisma.menuItem.create({
    data: {
      merchantId: merchantAyu.id,
      name: 'Es Kopi Susu Gula Aren',
      description: 'Kopi susu andalan dengan gula aren asli',
      originalPrice: 20000,
      isActive: true,
    },
  });

  const menuRoti = await prisma.menuItem.create({
    data: {
      merchantId: merchantAyu.id,
      name: 'Roti Bakar Coklat Keju',
      description: 'Roti bakar tebal lumer',
      originalPrice: 25000,
      isActive: true,
    },
  });

  const menuNonaktif = await prisma.menuItem.create({
    data: {
      merchantId: merchantAyu.id,
      name: 'Donat Kampung',
      description: 'Donat gula halus',
      originalPrice: 10000,
      isActive: false,
    },
  });

  const today = new Date();

  const surplusKopi = await prisma.surplusItem.create({
    data: {
      menuItemId: menuKopi.id,
      merchantId: merchantAyu.id,
      discountPrice: 10000,
      originalPrice: 20000,
      stock: 8,
      isActive: true,
      date: today,
    },
  });

  const surplusRoti = await prisma.surplusItem.create({
    data: {
      menuItemId: menuRoti.id,
      merchantId: merchantAyu.id,
      discountPrice: 12000,
      originalPrice: 25000,
      stock: 3,
      isActive: true,
      date: today,
    },
  });

  const surplusHabis = await prisma.surplusItem.create({
    data: {
      menuItemId: menuKopi.id,
      merchantId: merchantAyu.id,
      discountPrice: 10000,
      originalPrice: 20000,
      stock: 0,
      isActive: false,
      date: today,
    },
  });

  const now = new Date();
  const future15 = new Date(now.getTime() + 15 * 60000);
  const past60 = new Date(now.getTime() - 60 * 60000);
  const past30 = new Date(now.getTime() - 30 * 60000);

  const orderPending = await prisma.order.create({
    data: {
      userId: userCustomerSiti.id,
      merchantId: merchantAyu.id,
      status: 'PENDING',
      totalAmount: 10000,
      totalOriginal: 20000,
      qrCode: `QR-PENDING-${Date.now()}`,
      expiredAt: future15,
      orderItems: {
        create: [
          {
            surplusItemId: surplusKopi.id,
            name: menuKopi.name,
            quantity: 1,
            discountPrice: 10000,
            originalPrice: 20000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: orderPending.id,
      transactionId: `TX-PENDING-${Date.now()}`,
      status: 'PENDING',
      amount: 10000,
      snapToken: 'snap-token-mock-123',
    },
  });

  const orderProcessing = await prisma.order.create({
    data: {
      userId: userCustomerAgus.id,
      merchantId: merchantAyu.id,
      status: 'PROCESSING',
      totalAmount: 22000,
      totalOriginal: 45000,
      qrCode: `QR-PROCESSING-${Date.now()}`,
      notes: 'Es dipisah',
      expiredAt: future15,
      paidAt: past30,
      orderItems: {
        create: [
          {
            surplusItemId: surplusKopi.id,
            name: menuKopi.name,
            quantity: 1,
            discountPrice: 10000,
            originalPrice: 20000,
          },
          {
            surplusItemId: surplusRoti.id,
            name: menuRoti.name,
            quantity: 1,
            discountPrice: 12000,
            originalPrice: 25000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: orderProcessing.id,
      transactionId: `TX-PROC-${Date.now()}`,
      status: 'SUCCESS',
      amount: 22000,
    },
  });

  const orderCompleted = await prisma.order.create({
    data: {
      userId: userCustomerSiti.id,
      merchantId: merchantAyu.id,
      status: 'COMPLETED',
      totalAmount: 32000,
      totalOriginal: 65000,
      qrCode: `QR-COMPLETED-${Date.now()}`,
      expiredAt: past60,
      paidAt: past60,
      completedAt: past30,
      orderItems: {
        create: [
          {
            surplusItemId: surplusKopi.id,
            name: menuKopi.name,
            quantity: 2,
            discountPrice: 10000,
            originalPrice: 20000,
          },
          {
            surplusItemId: surplusRoti.id,
            name: menuRoti.name,
            quantity: 1,
            discountPrice: 12000,
            originalPrice: 25000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: orderCompleted.id,
      transactionId: `TX-COMP-${Date.now()}`,
      status: 'SUCCESS',
      amount: 32000,
    },
  });

  await prisma.review.create({
    data: {
      userId: userCustomerSiti.id,
      merchantId: merchantAyu.id,
      orderId: orderCompleted.id,
      rating: 5,
      comment: 'Kopinya masih sangat layak minum dan rotinya enak!',
    },
  });

  const orderCancelledExpired = await prisma.order.create({
    data: {
      userId: userCustomerAgus.id,
      merchantId: merchantAyu.id,
      status: 'CANCELLED',
      totalAmount: 12000,
      totalOriginal: 25000,
      qrCode: `QR-CANC-EXP-${Date.now()}`,
      expiredAt: past60,
      orderItems: {
        create: [
          {
            surplusItemId: surplusRoti.id,
            name: menuRoti.name,
            quantity: 1,
            discountPrice: 12000,
            originalPrice: 25000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: orderCancelledExpired.id,
      transactionId: `TX-EXP-${Date.now()}`,
      status: 'EXPIRED',
      amount: 12000,
    },
  });

  const orderCancelledFailed = await prisma.order.create({
    data: {
      userId: userCustomerSiti.id,
      merchantId: merchantAyu.id,
      status: 'CANCELLED',
      totalAmount: 20000,
      totalOriginal: 40000,
      qrCode: `QR-CANC-FAIL-${Date.now()}`,
      expiredAt: future15,
      orderItems: {
        create: [
          {
            surplusItemId: surplusKopi.id,
            name: menuKopi.name,
            quantity: 2,
            discountPrice: 10000,
            originalPrice: 20000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: orderCancelledFailed.id,
      transactionId: `TX-FAIL-${Date.now()}`,
      status: 'FAILED',
      amount: 20000,
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
