import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSurplusDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiProperty()
  discountPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiProperty()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isActive?: boolean;
}
