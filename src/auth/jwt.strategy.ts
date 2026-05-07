import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      // Memberitahu satpam untuk mencari token di header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Tolak token yang sudah expired
      secretOrKey: process.env.JWT_SECRET || 'HAPHAP_SUPER_SECRET_KEY_2026',
    });
  }

  // Fungsi ini otomatis dipanggil JIKA tokennya terbukti asli
  async validate(payload: any) {
    // payload.sub berisi ID User dari token JWT
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Token valid, tapi user sudah tidak ada di database');
    }

    // Return payload agar bisa ditangkap oleh @Request() di Controller
    return payload; 
  }
}