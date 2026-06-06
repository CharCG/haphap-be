import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MidtransWebhookDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  order_id!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transaction_id!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transaction_status!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fraud_status!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  status_code!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  gross_amount!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  signature_key!: string;
}
