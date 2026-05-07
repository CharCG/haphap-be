import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Pastikan path sesuai
import { JwtStrategy } from './jwt.strategy'; 

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      // Dalam produksi nyata, SECRET ini WAJIB ditaruh di file .env
      secret: process.env.JWT_SECRET || 'HAPHAP_SUPER_SECRET_KEY_2026', 
      signOptions: { expiresIn: '7d' }, // Token berlaku 7 hari
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}