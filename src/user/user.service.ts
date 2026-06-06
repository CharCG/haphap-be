import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      totalSaved: user.totalSaved,
      totalPortion: user.totalPortion,
    };
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: dto,
    });

    return {
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async updateMyPassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      userId: updatedUser.id,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
