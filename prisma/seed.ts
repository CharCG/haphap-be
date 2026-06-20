import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start Database Seeding...');

  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.surplusItem.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.merchant.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('Seeding users...');

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@haphap.com',
      name: 'Joni',
      password: hashedPassword,
      phone: '081234567890',
      role: 'CUSTOMER',
      totalSaved: 30000,
      totalPortion: 2,
    },
  });

  const merchantUser = await prisma.user.create({
    data: {
      email: 'merchant@haphap.com',
      name: 'Joko',
      password: hashedPassword,
      phone: '081298765432',
      role: 'MERCHANT',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@haphap.com',
      name: 'Admin',
      password: hashedPassword,
      phone: '081200000000',
      role: 'ADMIN',
    },
  });

  console.log('Seeding merchant profile...');

  const merchant = await prisma.merchant.create({
    data: {
      userId: merchantUser.id,
      merchantName: 'Sate Madura Pak Joko',
      address: 'Jl. Melawai 5 No. 3, Kebayoran Baru, Jakarta Selatan',
      latitude: -6.24432,
      longitude: 106.7994,
      description: 'Sate ayam dan sate kambing khas Madura legendaris',
      openTime: '10:00',
      closeTime: '22:00',
      phone: '081234567892',
      categories: ['RESTORAN', 'JAJANAN'],
      rating: 4.8,
      totalRevenue: 20000,
      totalPortion: 1,
    },
  });

  console.log('Seeding menu items...');

  const item1 = await prisma.menuItem.create({
    data: {
      merchantId: merchant.id,
      name: 'Sate Ayam Madura',
      description: '10 tusuk sate ayam dengan bumbu kacang gurih dan lontong',
      originalPrice: 40000,
      isActive: true,
    },
  });

  const item2 = await prisma.menuItem.create({
    data: {
      merchantId: merchant.id,
      name: 'Sate Kambing Muda',
      description: '10 tusuk sate kambing dengan bumbu kecap pedas mantap',
      originalPrice: 60000,
      isActive: true,
    },
  });

  console.log('Seeding surplus items...');

  const today = new Date();

  const surplus1 = await prisma.surplusItem.create({
    data: {
      menuItemId: item1.id,
      merchantId: merchant.id,
      discountPrice: 20000,
      originalPrice: 40000,
      stock: 10,
      isActive: true,
      date: today,
    },
  });

  const surplus2 = await prisma.surplusItem.create({
    data: {
      menuItemId: item2.id,
      merchantId: merchant.id,
      discountPrice: 30000,
      originalPrice: 60000,
      stock: 5,
      isActive: true,
      date: today,
    },
  });

  console.log('Seeding orders...');

  // Pending Order
  const pendingExpiredAt = new Date();
  pendingExpiredAt.setMinutes(pendingExpiredAt.getMinutes() + 15);

  const pendingOrder = await prisma.order.create({
    data: {
      userId: customerUser.id,
      merchantId: merchant.id,
      status: 'PENDING',
      totalAmount: 50000, // (20000 * 1) + (30000 * 1)
      totalOriginal: 100000, // (40000 * 1) + (60000 * 1)
      notes: 'Tolong sambelnya dipisah ya',
      expiredAt: pendingExpiredAt,
      qrCode: `pending-order-qr-${Date.now()}`,
      orderItems: {
        create: [
          {
            surplusItemId: surplus1.id,
            name: item1.name,
            quantity: 1,
            discountPrice: 20000,
            originalPrice: 40000,
          },
          {
            surplusItemId: surplus2.id,
            name: item2.name,
            quantity: 1,
            discountPrice: 30000,
            originalPrice: 60000,
          },
        ],
      },
    },
  });

  // Completed Order
  const completedOrder = await prisma.order.create({
    data: {
      userId: customerUser.id,
      merchantId: merchant.id,
      status: 'COMPLETED',
      totalAmount: 20000, // (20000 * 1)
      totalOriginal: 40000, // (40000 * 1)
      notes: null,
      expiredAt: new Date(Date.now() - 60 * 60 * 1000), // expired 1 hour ago
      completedAt: new Date(),
      qrCode: `completed-order-qr-${Date.now()}`,
      orderItems: {
        create: [
          {
            surplusItemId: surplus1.id,
            name: item1.name,
            quantity: 1,
            discountPrice: 20000,
            originalPrice: 40000,
          },
        ],
      },
    },
  });

  console.log('Seeding payment...');

  await prisma.payment.create({
    data: {
      orderId: completedOrder.id,
      transactionId: `TX-MOCK-${Date.now()}`,
      status: 'SUCCESS',
      amount: 20000,
    },
  });

  console.log('Seeding review...');

  await prisma.review.create({
    data: {
      userId: customerUser.id,
      merchantId: merchant.id,
      orderId: completedOrder.id,
      rating: 5,
      comment: 'Makanan enak, pelayanan ramah sekali!',
    },
  });

  console.log('Database seeding completed!');
  console.log('\n--- Seeded Accounts ---');
  console.log(`Customer: customer@haphap.com / password123`);
  console.log(`Merchant: merchant@haphap.com / password123`);
  console.log(`Admin: admin@haphap.com / password123`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
