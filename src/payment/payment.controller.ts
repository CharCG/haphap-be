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
  constructor(private readonly paymentService: PaymentService) { }

  @Post('webhook')
  async handleWebhook(@Body() dto: MidtransWebhookDto) {
    return this.paymentService.handleWebhook(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.MERCHANT)
  @Post(':orderId')
  async createPayment(@CurrentUser() user: CurrentUserDto, @Param('orderId') orderId: string) {
    return this.paymentService.createPayment(user.id, orderId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.MERCHANT)
  @Post(':orderId/verify')
  async verifyPayment(@CurrentUser() user: CurrentUserDto, @Param('orderId') orderId: string) {
    return this.paymentService.verifyPayment(user.id, orderId);
  }
}
