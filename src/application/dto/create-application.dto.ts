import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { MerchantCategory } from '../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  merchantName!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  address!: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  longitude!: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  @ApiProperty()
  openTime!: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  @ApiProperty()
  closeTime!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phone!: string;

  @IsArray()
  @IsEnum(MerchantCategory, { each: true })
  @ApiProperty({ enum: MerchantCategory, isArray: true })
  categories!: MerchantCategory[];
}
