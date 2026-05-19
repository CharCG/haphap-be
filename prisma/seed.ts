import { PrismaClient, Role, MerchantCategory  } from "generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({adapter: new PrismaPg({connectionString: "postgresql://postgres.lfzbbyaqalpvithoxugm:pantataconghjitam@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"})});

async function main() {
  console.log('🌱 Memulai proses seeding database HapHap...');

  // ---------------------------------------------------------
  // 1. Buat Akun Customer (Pembeli)
  // ---------------------------------------------------------
  const hashedpassword = await bcrypt.hash('password123', 10);
  const customer = await prisma.user.create({
    data: {
      name: 'Dennis Customer',
      email: 'customer@haphap.com',
      password: hashedpassword, 
      phone: '081234567890',
      role: Role.CUSTOMER,
    },
  });
  console.log(`✅ Customer dibuat: ${customer.email}`);

  // ---------------------------------------------------------
  // 2. Buat Akun Merchant Owner (Pemilik Toko)
  // ---------------------------------------------------------
  const merchantOwner = await prisma.user.create({
    data: {
      name: 'Pak Roti',
      email: 'owner@haphap.com',
      password: hashedpassword,
      phone: '089876543210',
      role: Role.MERCHANT,
    },
  });
  console.log(`✅ Akun Pemilik Toko dibuat: ${merchantOwner.email}`);

  // ---------------------------------------------------------
  // 3. Buat Profil Toko (Merchant)
  // ---------------------------------------------------------
  const merchant = await prisma.merchant.create({
    data: {
      userId: merchantOwner.id, 
      merchantName: 'Toko Roti HapHap Enak',
      address: 'Jl. Roti Bakar No. 1, Jakarta',
      latitude: -6.200000,
      longitude: 106.816666,
      openTime: '08:00',
      closeTime: '22:00',
      phone: '08111222333',
      categories: [MerchantCategory.ROTI, MerchantCategory.JAJANAN],
    },
  });
  console.log(`✅ Profil Toko dibuat: ${merchant.merchantName}`);

  // ---------------------------------------------------------
  // 4. Buat Menu Makanan (MenuItem)
  // ---------------------------------------------------------
  const menuItem = await prisma.menuItem.create({
    data: {
      merchantId: merchant.id, 
      name: 'Roti Coklat Lumer',
      description: 'Roti coklat lumer sisa produksi hari ini, masih layak konsumsi.',
      originalPrice: 15000,
      isActive: true,
    },
  });
  console.log(`✅ Menu Makanan dibuat: ${menuItem.name}`);

  // ---------------------------------------------------------
  // 5. Buat Stok Makanan Diskon (SurplusItem)
  // ---------------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const surplusItem = await prisma.surplusItem.create({
    data: {
      menuItemId: menuItem.id,  
      merchantId: merchant.id,  
      discountPrice: 5000,
      originalPrice: 15000,
      stock: 10,
      isActive: true,
      date: today,
    },
  });
  console.log(`✅ Stok Diskon dibuat! Jumlah: ${surplusItem.stock}`);

  // --- OUTPUT ID UNTUK PENGUJIAN THUNDER CLIENT ---
  console.log('\n======================================================');
  console.log('🎉 SEEDING SELESAI 100%! COPY ID INI UNTUK THUNDER CLIENT:');
  console.log(`Merchant ID     : ${merchant.id}`);
  console.log(`Surplus Item ID : ${surplusItem.id}`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });