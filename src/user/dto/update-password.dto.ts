import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty()
  newPassword!: string;
}
