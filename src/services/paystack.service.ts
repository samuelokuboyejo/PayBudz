import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { TopUpStatus } from 'src/enums/topup-status.enum';
import { Repository, DataSource } from 'typeorm';
import { WalletService } from './wallet.service';
import { Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { User } from 'src/entities/user.entity';

export class PaystackService {
  private logger = new Logger(PaystackService.name);
  constructor(
    @InjectRepository(WalletTopUpIntent)
    private walletTopUpIntentRepository: Repository<WalletTopUpIntent>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private dataSource: DataSource,
    private walletService: WalletService,
    private configService: ConfigService,
  ) {}

  private baseUrl = this.configService.get<string>('PAYSTACK_URL');
  private secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

  async initializePayment(intentId: string, amount: number, email: string) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        amount: amount * 100,
        email,
        reference: intentId,
      },
      {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      },
    );
    return response.data.data.authorization_url;
  }

  async verifyPayment(reference: string) {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      },
    );
    return response.data.data;
  }

  async initiateTopUp(
    userId: string,
    amount: number,
    currency: SupportedCurrencies,
    email: string,
  ) {
    const paystackReference = crypto.randomUUID();

    const intent = this.walletTopUpIntentRepository.create({
      userId,
      amount,
      currency,
      status: TopUpStatus.PENDING,
      paystackReference,
    });

    await this.walletTopUpIntentRepository.save(intent);

    const paymentLink = await this.initializePayment(
      paystackReference,
      amount,
      email,
    );

    return { paymentLink };
  }

  async finalizeTopUp(reference: string, webhookPayload: any) {
    await this.dataSource.transaction(async (manager) => {
      const intent = await manager.findOne(WalletTopUpIntent, {
        where: { paystackReference: reference },
      });

      if (!intent) {
        throw new Error('Wallet top up intent not found');
      }

      intent.webhookPayload = webhookPayload;

      const event = webhookPayload && webhookPayload.event;
      const status =
        webhookPayload && webhookPayload.data && webhookPayload.data.status;

      const isSuccessful = event === 'charge.success' && status === 'success';
      intent.updatedAt = new Date();

      if (isSuccessful) {
        intent.status = TopUpStatus.COMPLETED;
        await manager.save(intent);

        const user = await this.userRepository.findOneOrFail({
          where: { id: intent.userId },
        });

        const walletId = user.wallets[intent.currency];
        if (!walletId) {
          throw new NotFoundException('Wallet not found for this currency');
        }

        await this.walletService.fundWallet(
          walletId,
          intent.amount,
          intent.userId,
        );
      } else {
        intent.status = TopUpStatus.FAILED;
        await manager.save(intent);
      }
    });
  }
}
