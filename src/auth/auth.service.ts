import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exist');
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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
    };
  }
}
