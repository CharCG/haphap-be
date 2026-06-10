import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeUtil {
  constructor(private readonly configService: ConfigService) {}

  generateToken(orderId: string): string {
    return orderId;
  }

  validateToken(token: string, orderId: string): boolean {
    if (!token || !orderId) return false;
    return token === orderId;
  }

  extractOrderId(token: string): string | null {
    if (!token) return null;
    return token;
  }
}
