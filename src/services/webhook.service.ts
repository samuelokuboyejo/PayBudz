import { PaystackWebhookDto } from 'src/dto/paystack.dto';
import { Request } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { DataSource } from 'typeorm';
import { WalletService } from './wallet.service';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);
  private verifyUrl = this.configService.get<string>(
    'PPAYSTACK_API_VERIFY_URL',
  );
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    private walletService: WalletService,
  ) {}

  private paystackSecretKey = this.configService.get<string>(
    'PAYSTACK_SECRET_KEY',
  );

  async handlePaystackWebhook(req: Request): Promise<{ status: string }> {
    const signature = req.headers['x-paystack-signature'] as string;
    const payload = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(payload)
      .digest('hex');

    if (
      !signature ||
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature),
      )
    ) {
      this.logger.error('Invalid Paystack webhook signature');
      throw new Error('Invalid signature');
    }

    const body: PaystackWebhookDto = req.body as PaystackWebhookDto;
    const reference = body.data.reference;
    const event = body.event;

    if (event.startsWith('charge.')) {
      const verified = await this.verifyTransaction(reference);
      if (verified) {
        await this.walletService.processTopUpFromWebhook(reference, body);
      } else {
        this.logger.warn(
          `Transaction verification failed for reference: ${reference}`,
        );
      }
    } else if (event.startsWith('transfer.')) {
      await this.walletService.processCashoutFromWebhook(reference, body);
    } else {
      this.logger.warn(`Unhandled Paystack event: ${event}`);
    }

    return { status: 'ok' };
  }

  async verifyTransaction(
    reference: string,
  ): Promise<WalletTopUpIntent | null> {
    const intent = await this.dataSource
      .getRepository(WalletTopUpIntent)
      .findOne({ where: { paystackReference: reference } });

    if (!intent) return null;

    try {
      const url = `${this.verifyUrl}/${reference}`;
      const response: AxiosResponse<any> = await axios.get(url, {
        headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
      });

      const status = response.data?.data?.status;
      if (status === 'success' && intent.status !== 'COMPLETED') {
        return intent;
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to verify transaction: ${reference}:  ${error.message}`,
      );
      return null;
    }
  }
}
