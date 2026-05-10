import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from 'generated/prisma/client';

export class UpdateApplicationDto {
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @IsOptional()
  @IsString()
  rejectNote?: string;
}
