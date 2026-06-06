import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  originalPrice!: number;
}
