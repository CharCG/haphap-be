import { Body, Controller, Get, Patch, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { Roles } from '../../src/auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from '../../src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../../src/common/dto/current-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER, Role.MERCHANT)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() user: CurrentUserDto) {
    return this.userService.getMe(user.id);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: CurrentUserDto, @Body() dto: UpdateUserDto) {
    return this.userService.updateMe(user.id, dto);
  }

  @Patch('me/password')
  async updateMyPassword(@CurrentUser() user: CurrentUserDto, @Body() dto: UpdatePasswordDto) {
    return this.userService.updateMyPassword(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: CurrentUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(user.id, file);
  }
}
