import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
