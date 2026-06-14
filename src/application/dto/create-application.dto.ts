import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { MerchantCategory } from '../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  merchantName!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openTime!: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  closeTime!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({ enum: MerchantCategory, isArray: true })
  @IsArray()
  @IsEnum(MerchantCategory, { each: true })
  categories!: MerchantCategory[];
}
