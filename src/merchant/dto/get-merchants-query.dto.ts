import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { MerchantCategory } from '../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class GetMerchantsQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(MerchantCategory, { each: true })
  @ApiProperty({ enum: MerchantCategory, isArray: true })
  categories?: MerchantCategory[];
}
