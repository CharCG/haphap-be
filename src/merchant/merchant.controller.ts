import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { GetMerchantsQueryDto } from './dto/get-merchants-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  async getAll(@Query() dto: GetMerchantsQueryDto) {
    return this.merchantService.findAll(dto);
  }

  @Get(':merchantId')
  async findOne(@Param('merchantId') id: string) {
    return this.merchantService.findOne(id);
  }

  @Get(':merchantId/reviews')
  async findReviews(@Param('merchantId') id: string) {
    return this.merchantService.findReviews(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Get('me')
  async findMe(@CurrentUser() user: any) {
    return this.merchantService.findMe(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Patch('me')
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateMerchantDto) {
    return this.merchantService.updateMe(user.sub, dto);
  }
}
