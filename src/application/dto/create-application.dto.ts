import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { MerchantCategory } from '../../generated/prisma/enums';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  merchantName!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openTime!: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  closeTime!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsArray()
  @IsEnum(MerchantCategory, { each: true })
  categories!: MerchantCategory[];
}
