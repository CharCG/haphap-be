import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { MerchantCategory } from '../../../generated/prisma/enums';

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openTime?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  closeTime?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(MerchantCategory, { each: true })
  categories?: MerchantCategory[];
}
