import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { Roles } from '../../src/auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from '../../src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../../src/common/dto/current-user.dto';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook/midtrans')
  async handleWebhook(@Body() dto: MidtransWebhookDto) {
    return this.paymentService.handleWebhook(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post(':orderId')
  async createPayment(
    @Param('orderId') orderId: string,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.paymentService.createPayment(orderId, user.id);
  }
}