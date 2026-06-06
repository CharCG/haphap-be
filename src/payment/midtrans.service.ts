import { Injectable } from '@nestjs/common';
import * as MidtransClient from 'midtrans-client';

@Injectable()
export class MidtransService {
  private snap: MidtransClient.Snap;
  private core: MidtransClient.CoreApi;

  constructor() {
    this.snap = new MidtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });

    this.core = new MidtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });
  }

  async createTransaction(params: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
  }) {
    const { token, redirect_url } = await this.snap.createTransaction({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
    } as any);

    return { token, redirectUrl: redirect_url };
  }

  async verifyWebhookSignature(notification: any) {
    return (this.core as any).transaction.notification(notification);
  }
}