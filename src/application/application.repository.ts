import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Prisma, Role } from '../generated/prisma/client';
import { ApplicationStatus } from '../generated/prisma/enums';

@Injectable()
export class ApplicationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.application.findMany({
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prismaService.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(applicationId: string) {
    return this.prismaService.application.findUnique({
      where: { id: applicationId },
    });
  }

  async create(userId: string, data: Prisma.ApplicationUncheckedCreateWithoutUserInput) {
    return this.prismaService.application.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateStatusReject(applicationId: string, status: ApplicationStatus, rejectNote?: string) {
    return this.prismaService.application.update({
      where: { id: applicationId },
      data: {
        status,
        rejectNote,
        reviewedAt: new Date(),
      },
    });
  }

  async updateStatusApprove(applicationId: string, application: any) {
    return this.prismaService.$transaction(async (prisma) => {
      const updatedApp = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedAt: new Date(),
        },
      });

      await prisma.merchant.create({
        data: {
          userId: application.userId,
          merchantName: application.merchantName,
          address: application.address,
          latitude: application.latitude,
          longitude: application.longitude,
          description: application.description,
          openTime: application.openTime,
          closeTime: application.closeTime,
          phone: application.phone,
          categories: application.categories,
        },
      });

      await prisma.user.update({
        where: { id: application.userId },
        data: { role: Role.MERCHANT },
      });

      return updatedApp;
    });
  }
}
