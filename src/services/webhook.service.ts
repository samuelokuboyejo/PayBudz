import { PaystackWebhookDto } from 'src/dto/paystack.dto';
import { Request } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaystackService } from './paystack.service';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);
  constructor(
    private configService: ConfigService,
    private paystackservice: PaystackService,
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

    await this.paystackservice.finalizeTopUp(reference, body);
    return { status: 'ok' };
  }
}
