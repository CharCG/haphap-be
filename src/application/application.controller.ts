import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from '../../src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../../src/common/dto/current-user.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.applicationService.findAll();
  }

  @Post()
  @Roles(Role.CUSTOMER)
  async create(@CurrentUser() user: CurrentUserDto, @Body() dto: CreateApplicationDto) {
    return this.applicationService.create(user.id, dto);
  }

  @Get('me')
  @Roles(Role.CUSTOMER)
  async findMyApplications(@CurrentUser() user: CurrentUserDto) {
    return this.applicationService.findMyApplications(user.id);
  }

  @Patch(':applicationId')
  @Roles(Role.ADMIN)
  async updateStatus(@Param('applicationId') applicationId: string, @Body() dto: UpdateApplicationDto) {
    return this.applicationService.updateStatus(applicationId, dto);
  }
}
