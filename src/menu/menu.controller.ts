import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserDto } from '../common/dto/current-user.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async findAll(@CurrentUser() user: CurrentUserDto) {
    return this.menuService.findAll(user.id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  async create(
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: CreateMenuItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.menuService.create(user.id, dto, image);
  }

  @Get(':menuItemId')
  async findOne(@CurrentUser() user: CurrentUserDto, @Param('menuItemId') menuItemId: string) {
    return this.menuService.findOne(user.id, menuItemId);
  }

  @Patch(':menuItemId')
  async update(
    @CurrentUser() user: CurrentUserDto,
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(user.id, menuItemId, dto);
  }

  @Delete(':menuItemId')
  async remove(@CurrentUser() user: CurrentUserDto, @Param('menuItemId') menuItemId: string) {
    return this.menuService.remove(user.id, menuItemId);
  }

  // @Post(':menuItemId/image')
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiConsumes('multipart/form-data')
  // async uploadImage(
  //   @CurrentUser() user: CurrentUserDto,
  //   @Param('menuItemId') menuItemId: string,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return this.menuService.uploadImage(user.id, menuItemId, file);
  // }
}
