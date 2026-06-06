import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSurplusDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  menuItemId!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty()
  discountPrice!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty()
  stock!: number;
}
