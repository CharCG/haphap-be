import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { MerchantCategory } from 'generated/prisma/enums';

export class GetMerchantsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(MerchantCategory, { each: true })
  categories?: MerchantCategory[];
}
