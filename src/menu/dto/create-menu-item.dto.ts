import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  image?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty()
  originalPrice!: number;
}
