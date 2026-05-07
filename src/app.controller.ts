import { Controller, Get, BadRequestException } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('test-success')
  getSuccess() {
    return {
      id: 1,
      name: 'John Doe',
      role: 'Admin',
    };
  }
  @Get('test-error-string')
  getErrorString() {
    throw new BadRequestException('Email sudah terdaftar, gunakan email lain');
  }

  @Get('test-error-array')
  getErrorArray() {
    throw new BadRequestException([
      'password must be longer than or equal to 8 characters',
      'password must contain an uppercase letter',
    ]);
  }
}
