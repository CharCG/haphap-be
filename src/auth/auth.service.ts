import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.authRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.authRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
    });

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      accessToken,
    };
  }

  async validateGoogleUser(dto: any) {
    let user = await this.authRepository.findByEmail(dto.email);

    if (!user) {
      user = await this.authRepository.create({
        name: `${dto.firstName} ${dto.lastName}`,
        email: dto.email,
        password: '',
        phone: '',
      });
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      accessToken,
    };
  }

  async loginWithGoogle(idToken: string) {
  const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);
  
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_WEB_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new UnauthorizedException('Invalid Google token');
  }

  return this.validateGoogleUser({
    email: payload.email,
    firstName: payload.given_name ?? '',
    lastName: payload.family_name ?? '',
  });
}

}
