import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '../generated/prisma/enums';

@Injectable()
export class ApplicationService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const applications = await this.prismaService.application.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      applicationId: a.id,
      userName: a.user.name,
      merchantName: a.merchantName,
      status: a.status,
      createdAt: a.createdAt,
    }));
  }

  async findMyApplications(userId: string) {
    const applications = await this.prismaService.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      applicationId: a.id,
      merchantName: a.merchantName,
      status: a.status,
      rejectNote: a.rejectNote,
      reviewedAt: a.reviewedAt,
      createdAt: a.createdAt,
    }));
  }

  async create(userId: string, dto: CreateApplicationDto) {
    const activeApps = await this.prismaService.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const hasPending = activeApps.some((a) => a.status === ApplicationStatus.PENDING);

    if (hasPending) {
      throw new BadRequestException('You already have a pending application');
    }

    const application = await this.prismaService.application.create({
      data: {
        ...dto,
        userId,
      },
    });

    return {
      applicationId: application.id,
      merchantName: application.merchantName,
      status: application.status,
      address: application.address,
      latitude: application.latitude,
      longitude: application.longitude,
      description: application.description,
      openTime: application.openTime,
      closeTime: application.closeTime,
      phone: application.phone,
      categories: application.categories,
      createdAt: application.createdAt,
    };
  }

  async updateStatus(applicationId: string, dto: UpdateApplicationDto) {
    const application = await this.prismaService.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(`Application already ${application.status}`);
    }

    let updatedApp;

    if (dto.status === ApplicationStatus.APPROVED) {
      updatedApp = await this.prismaService.application.update({
        where: { id: applicationId },
        data: { status: dto.status },
      });

      await this.prismaService.merchant.create({
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
    } else {
      updatedApp = await this.prismaService.application.update({
        where: { id: applicationId },
        data: { status: dto.status, rejectNote: dto.rejectNote, reviewedAt: new Date() },
      });
    }

    return {
      applicationId: updatedApp.id,
      status: updatedApp.status,
      rejectNote: updatedApp.rejectNote,
      updatedAt: updatedApp.updatedAt,
    };
  }
}
