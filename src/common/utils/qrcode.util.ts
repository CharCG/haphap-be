import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeUtil {
  private readonly secret: string;
  private readonly qrCodeExpiry = 15 * 60 * 1000; // align with order expiry (15 min)

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    this.secret = secret; // resolved once, used consistently everywhere
  }

  generateToken(orderId: string): string {
    const timestamp = Date.now();
    const data = `${orderId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', this.secret).update(data).digest('hex');
    return `${data}:${hmac}`;
  }

  validateToken(orderId: string, token: string): boolean {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) return false;

      const [tokenOrderId, timestamp, providedHmac] = parts;

      if (tokenOrderId !== orderId) return false;

      const tokenTime = parseInt(timestamp, 10);
      if (isNaN(tokenTime)) return false;
      if (Date.now() - tokenTime > this.qrCodeExpiry) return false;

      const data = `${tokenOrderId}:${timestamp}`;
      const expectedHmac = crypto
        .createHmac('sha256', this.secret) // same secret guaranteed
        .update(data)
        .digest('hex');
``
      // Timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(Buffer.from(providedHmac, 'hex'), Buffer.from(expectedHmac, 'hex'));
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
