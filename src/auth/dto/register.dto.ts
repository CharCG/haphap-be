import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty()
  password!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phone!: string;
}
