import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplicationDto {
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  @ApiProperty({ enum: ApplicationStatus })
  status!: ApplicationStatus;

  @IsOptional()
  @IsString()
  @ApiProperty()
  rejectNote?: string;
}
