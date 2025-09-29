import axios from 'axios';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PaystackService {
  private logger = new Logger(PaystackService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  private baseUrl = this.configService.get<string>('PAYSTACK_API_URL');
  private paystackecretKey = this.configService.get<string>(
    'PAYSTACK_SECRET_KEY',
  );

  async initializePayment(intentId: string, amount: number, email: string) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        amount: amount * 100,
        email,
        reference: intentId,
      },
      {
        headers: { Authorization: `Bearer ${this.paystackecretKey}` },
      },
    );
    return response.data.data.authorization_url;
  }

  async parseTopUpWebhook(reference: string, webhookPayload: any) {
    const event = webhookPayload?.event;
    const status = webhookPayload?.data?.status;
    const isSuccessful = event === 'charge.success' && status === 'success';

    return {
      isSuccessful,
      reference,
      payload: webhookPayload,
      userId: webhookPayload?.data?.metadata?.userId,
      amount: webhookPayload?.data?.amount / 100,
      currency: webhookPayload?.data?.currency,
    };
  }

  async parseCashoutWebhook(reference: string, webhookPayload: any) {
    const event = webhookPayload?.event;
    const status = webhookPayload?.data?.status;
    const isSuccessful = event === 'transfer.success' || status === 'success';
    return {
      isSuccessful,
      reference,
      payload: webhookPayload,
      userId: webhookPayload?.data?.metadata?.userId,
      amount: webhookPayload?.data?.amount / 100,
      currency: webhookPayload?.data?.currency,
    };
  }

  async createPayout(
    accountNumber: string,
    bankCode: string,
    amount: number,
    currency: string,
    reference: string,
  ): Promise<any> {
    try {
      const recipientRes = await this.httpService.axiosRef.post(
        `${this.baseUrl}/transferrecipient`,
        {
          type: 'nuban',
          name: 'Cashout Recipient',
          account_number: accountNumber,
          bank_code: bankCode,
          currency,
        },
        { headers: { Authorization: `Bearer ${this.paystackecretKey}` } },
      );

      const recipientCode = recipientRes.data.data.recipient_code;

      const transferRes = await this.httpService.axiosRef.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          amount: Math.round(Number(amount) * 100),
          recipient: recipientCode,
          reference,
          reason: 'Wallet Cashout',
        },
        { headers: { Authorization: `Bearer ${this.paystackecretKey}` } },
      );

      return transferRes.data;
    } catch (error) {
      this.logger.error('Error creating Paystack payout', error);
      throw error;
    }
  }
}
