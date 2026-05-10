import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationRepository } from './application.repository';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from 'generated/prisma/enums';

@Injectable()
export class ApplicationService {
  constructor(private readonly applicationRepository: ApplicationRepository) {}

  async findAll() {
    const applications = await this.applicationRepository.findAll();

    return applications.map((a) => ({
      applicationId: a.id,
      userName: a.user.name,
      merchantName: a.merchantName,
      status: a.status,
      createdAt: a.createdAt,
    }));
  }

  async findMyApplications(userId: string) {
    const applications = await this.applicationRepository.findByUserId(userId);

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
    const activeApps = await this.applicationRepository.findByUserId(userId);
    const hasPending = activeApps.some((a) => a.status === ApplicationStatus.PENDING);

    if (hasPending) {
      throw new BadRequestException('You already have a pending application');
    }

    const application = await this.applicationRepository.create(userId, dto);

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
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(`Application is already ${application.status}`);
    }

    let updatedApp;

    if (dto.status === ApplicationStatus.APPROVED) {
      updatedApp = await this.applicationRepository.updateStatusApprove(applicationId, application);
    } else {
      updatedApp = await this.applicationRepository.updateStatusReject(applicationId, dto.status, dto.rejectNote);
    }

    return {
      applicationId: updatedApp.id,
      status: updatedApp.status,
      rejectNote: updatedApp.rejectNote,
      updatedAt: updatedApp.updatedAt,
    };
  }
}
