import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getMe(id: string) {
    const user = await this.userRepository.findById(id);

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

  async updateMe(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Email is already in use');
      }
    }

    const updatedUser = await this.userRepository.update(id, dto);

    return {
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    const updatedUser = await this.userRepository.update(id, {
      password: hashedPassword,
    });

    return {
      userId: updatedUser.id,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
