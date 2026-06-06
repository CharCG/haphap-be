import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  originalPrice!: number;
}
