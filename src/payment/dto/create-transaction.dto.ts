import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  orderId!: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  grossAmount!: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  customerName!: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  customerEmail!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  customerPhone!: string;
}
