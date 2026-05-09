import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }
}
