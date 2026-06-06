import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSurplusDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  discountPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}