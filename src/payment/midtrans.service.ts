import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Snap } from 'midtrans-client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class MidtransService {
  private midtransSnapClient: Snap;

  constructor(private readonly configService: ConfigService) {
    this.midtransSnapClient = new Snap({
      isProduction: configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: configService.get<string>('MIDTRANS_SERVER_KEY') as any,
      clientKey: configService.get<string>('MIDTRANS_CLIENT_KEY') as any,
    });
  }

  async createTransaction(dto: CreateTransactionDto) {
    const transaction = await this.midtransSnapClient.createTransaction({
      transaction_details: {
        order_id: dto.orderId,
        gross_amount: dto.grossAmount,
      },
      customer_details: {
        first_name: dto.customerName,
        email: dto.customerEmail,
        phone: dto.customerPhone,
      },
    } as any);

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  }

  async verifyWebhookSignature(dto: MidtransWebhookDto) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY')!;
    const payload = `${dto.order_id}${dto.status_code}${dto.gross_amount}${serverKey}`;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');
    return hash === dto.signature_key;
  }
}
