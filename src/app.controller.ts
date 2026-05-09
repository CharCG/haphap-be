import { Controller, Get, BadRequestException } from '@nestjs/common';
import { ActiveRole } from 'generated/prisma/enums';

@Controller()
export class AppController {
  @Get('test-success')
  getSuccess() {
    return {
      id: 1,
      name: 'John Doe',
      role: ActiveRole.ADMIN,
    };
  }
  @Get('test-error-string')
  getErrorString() {
    throw new BadRequestException('Email already registered, please use a different email');
  }

  @Get('test-error-array')
  getErrorArray() {
    throw new BadRequestException([
      'password must be longer than or equal to 8 characters',
      'password must contain an uppercase letter',
    ]);
  }
}
