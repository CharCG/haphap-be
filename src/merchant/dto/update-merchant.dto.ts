import { IsArray, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { MerchantCategory } from '../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  @ApiProperty()
  openTime?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  @ApiProperty()
  closeTime?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  avatar?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(MerchantCategory, { each: true })
  @ApiProperty({ enum: MerchantCategory, isArray: true })
  categories?: MerchantCategory[];
}
