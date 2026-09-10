import crypto from 'crypto';

export class QrCodeUtil {
  static generateToken(orderId: string): string {
    const secret = process.env.JWT_SECRET!;
    return crypto.createHmac('sha256', secret).update(orderId).digest('hex');
  }

  static validateToken(token: string, orderId: string): boolean {
    if (!token || !orderId) {
      return false;
    }

    const expected = QrCodeUtil.generateToken(orderId);

    if (token.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  }
}
