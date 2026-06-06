import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
