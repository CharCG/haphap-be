import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeUtil {
  constructor(private readonly configService: ConfigService) {}

  generateToken(orderId: string): string {
    const timestamp = Date.now();
    const data = `${orderId}:${timestamp}`;
    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex');
    return `${data}:${hmac}`;
  }

  validateToken(orderId: string, token: string): boolean {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) return false;

      const [tokenOrderId, timestamp, providedHmac] = parts;
      const qrCodeExpiry = 60 * 60 * 1000; // 1 hour

      // Verify order ID matches
      if (tokenOrderId !== orderId) return false;

      // Check if token has expired
      const tokenTime = parseInt(timestamp, 10);
      if (Date.now() - tokenTime > qrCodeExpiry) return false;

      // Verify HMAC
      const data = `${tokenOrderId}:${timestamp}`;
      const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
      const expectedHmac = crypto.createHmac('sha256', secret).update(data).digest('hex');

      return providedHmac === expectedHmac;
    } catch {
      return false;
    }
  }

  extractOrderId(token: string): string | null {
    try {
      const parts = token.split(':');
      return parts.length === 3 ? parts[0] : null;
    } catch {
      return null;
    }
  }
}
