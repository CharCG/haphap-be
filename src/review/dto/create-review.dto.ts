import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  orderId!: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  merchantId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty()
  rating!: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  comment?: string;
}
