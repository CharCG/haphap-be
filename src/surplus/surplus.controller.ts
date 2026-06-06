import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SurplusService } from './surplus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserDto } from '../common/dto/current-user.dto';
import { CreateSurplusDto } from './dto/create-surplus.dto';
import { UpdateSurplusDto } from './dto/update-surplus.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT)
@Controller('surplus')
export class SurplusController {
  constructor(private readonly surplusService: SurplusService) {}

  @Get()
  async findAll(@CurrentUser() user: CurrentUserDto) {
    return this.surplusService.findAll(user.id);
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserDto, @Body() dto: CreateSurplusDto) {
    return this.surplusService.create(user.id, dto);
  }

  @Patch(':surplusItemId')
  async update(
    @CurrentUser() user: CurrentUserDto,
    @Param('surplusItemId') surplusItemId: string,
    @Body() dto: UpdateSurplusDto,
  ) {
    return this.surplusService.update(user.id, surplusItemId, dto);
  }
}
