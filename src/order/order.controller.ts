import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserDto } from 'src/common/dto/current-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  async create(@CurrentUser() user: CurrentUserDto, @Body() dto: CreateOrderDto) {
    return await this.orderService.create(user.id, dto);
  }

  @Get('me')
  @Roles(Role.CUSTOMER)
  async findOrderMe(@CurrentUser() user: CurrentUserDto) {
    return await this.orderService.findOrderMe(user.id);
  }

  @Get(':orderId')
  @Roles(Role.CUSTOMER, Role.MERCHANT)
  async findOrderById(@Param('orderId') orderId: string, @CurrentUser() user: CurrentUserDto) {
    return await this.orderService.findOrderById(orderId, user);
  }
  
  @Get('merchant')
  @Roles(Role.MERCHANT)
  async findOrderMerchant(@CurrentUser() user: CurrentUserDto) {
    return await this.orderService.findOrderMerchant(user.id);
  }
  
  @Patch(':orderId/scan')
  @Roles(Role.MERCHANT)
  async scanOrder(@Param('orderId') orderId: string, @CurrentUser() currentUser: CurrentUserDto, @Body() dto: { qrCode: string }) {
    return await this.orderService.scanOrder(orderId, currentUser.id, dto.qrCode);
  }
} 
