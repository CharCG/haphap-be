import { IsArray, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { MerchantCategory } from '../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMerchantDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openTime?: string;

  @ApiProperty()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  closeTime?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ enum: MerchantCategory, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(MerchantCategory, { each: true })
  categories?: MerchantCategory[];
}
