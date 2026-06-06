import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { Roles } from '../../src/auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from '../../src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../../src/common/dto/current-user.dto';
import { GetMerchantsQueryDto } from './dto/get-merchants-query.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  async findAll(@Query() dto: GetMerchantsQueryDto) {
    return this.merchantService.findAll(dto);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Get('me')
  async getMe(@CurrentUser() user: CurrentUserDto) {
    return this.merchantService.getMe(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Patch('me')
  async updateMe(@CurrentUser() user: CurrentUserDto, @Body() dto: UpdateMerchantDto) {
    return this.merchantService.updateMe(user.id, dto);
  }

  @Get(':merchantId')
  async findOne(@Param('merchantId') merchantId: string) {
    return this.merchantService.findOne(merchantId);
  }

  @Get(':merchantId/reviews')
  async findReviews(@Param('merchantId') merchantId: string) {
    return this.merchantService.findReviews(merchantId);
  }
}
