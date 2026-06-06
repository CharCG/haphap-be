import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateSurplusDto {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @Min(1)
  discountPrice: number;

  @IsInt()
  @Min(1)
  stock: number;
}