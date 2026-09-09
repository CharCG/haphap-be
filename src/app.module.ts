import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MerchantModule } from './merchant/merchant.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';
import { ApplicationModule } from './application/application.module';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { SurplusModule } from './surplus/surplus.module';
import { MenuModule } from './menu/menu.module';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { createObserveModule } from '@nestjs/observe';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MerchantModule,
    UserModule,
    ReviewModule,
    ApplicationModule,
    PaymentModule,
    OrderModule,
    SurplusModule,
    MenuModule,
    StorageModule,
    // ObserveModule.forRoot({
    //   appKey: process.env.OBSERVE_APP_KEY,
    //   appSecret: process.env.OBSERVE_APP_SECRET,
    //   serviceId: 'haphap-be',
    // }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
