/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { CreateWalletDto } from '../dto/wallet.dto';
import { WalletBalanceDto } from 'src/dto/wallet-balance.dto';
import { SupportedCurrencies } from '../enums/currency.enum';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionStatus } from 'src/enums/transaction-status.enum';
import { TransactionType } from 'src/enums/transaction-type.enum';
import { UserService } from './user.service';
import { NotificationService } from './notification.service';
import { WalletCashoutDto } from 'src/dto/wallet-cashout.dto';
import { WalletCashoutIntent } from 'src/entities/wallet-cashout-intent.entity';
import { CashoutStatus } from 'src/enums/cashout-status.enum';
import { randomUUID } from 'crypto';
import { PaystackService } from './paystack.service';
import { TopUpStatus } from 'src/enums/topup-status.enum';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { v4 as uuidv4 } from 'uuid';
import { AdminAnalyticsService } from './admin-analytics-service';

@Injectable()
export class WalletService {
  private logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    @InjectRepository(WalletCashoutIntent)
    private walletCashoutIntentRepository: Repository<WalletCashoutIntent>,

    @InjectRepository(WalletTopUpIntent)
    private walletTopUpIntentRepository: Repository<WalletTopUpIntent>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private userService: UserService,
    private notificationService: NotificationService,
    private paystackService: PaystackService,
    private adminAnalyticsService: AdminAnalyticsService,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      currency: createWalletDto.currency,
      isActive: false,
    });

    return await this.walletRepository.save(wallet);
  }

  async findWalletById(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async activateWallet(walletId: string): Promise<Wallet> {
    const wallet = await this.findWalletById(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet with id found');
    }

    if (wallet.isActive) {
      throw new BadRequestException('Wallet already active');
    }

    wallet.isActive = true;
    wallet.updatedAt = new Date();
    return this.walletRepository.save(wallet);
  }

  async deactivateWallet(walletId: string): Promise<Wallet> {
    const wallet = await this.findWalletById(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet with id found');
    }

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet already inactive');
    }

    wallet.isActive = false;
    wallet.updatedAt = new Date();
    return this.walletRepository.save(wallet);
  }

  async getWalletBalance(walletId: string): Promise<WalletBalanceDto> {
    const wallet = await this.findWalletById(walletId);
    const [row] = await this.dataSource.query(
      `SELECT * FROM wallet_balances WHERE wallet_id = $1`,
      [walletId],
    );

    const availableBalance = Number(row?.balance || 0);
    return {
      walletId,
      availableBalance,
      currency: wallet.currency as SupportedCurrencies,
    };
  }

  async fundWallet(walletId: string, amount: number, userId: string) {
    const wallet = await this.findWalletById(walletId);
    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is inactive');
    }

    let creditTransaction: Transaction;

    await this.dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);

      creditTransaction = transactionRepo.create({
        amount,
        walletId: wallet.id,
        currency: wallet.currency as SupportedCurrencies,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESSFUL,
        createdAt: new Date(),
        updatedAt: new Date(),
        idempotencyKey: uuidv4(),
      });
      await transactionRepo.save(creditTransaction);

      await this.adminAnalyticsService.recordTransaction(
        amount,
        manager,
        userId,
        TransactionType.CREDIT,
        wallet.currency,
        creditTransaction.idempotencyKey,
      );

      await this.adminAnalyticsService.updateUserTransactionStats(
        userId,
        amount,
        TransactionType.CREDIT,
        manager,
      );
    });

    const user = await this.userService.findById(userId);
    try {
      const balanceAfterCredit = await this.getWalletBalance(wallet.id);

      await this.notificationService.sendWalletTopupNotificationEmail({
        userEmail: user.email.trim(),
        amount,
        currency: wallet.currency,
        balanceAfter: balanceAfterCredit.availableBalance,
        txId: creditTransaction.id,
        occurredAt: creditTransaction.createdAt,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send fundWallet notification for walletId=${wallet.id}: ${err.message}`,
      );
    }

    return creditTransaction;
  }

  async getTopupPaymentLink(
    userId: string,
    amount: number,
    currency: SupportedCurrencies,
    email: string,
  ) {
    const paystackReference = randomUUID();

    const intent = this.walletTopUpIntentRepository.create({
      userId,
      amount,
      currency,
      status: TopUpStatus.PENDING,
      paystackReference,
    });

    await this.walletTopUpIntentRepository.save(intent);

    const paymentLink = await this.paystackService.initializePayment(
      paystackReference,
      amount,
      email,
    );

    return { paymentLink };
  }

  async processTopUpFromWebhook(reference: string, payload: any) {
    const result = await this.paystackService.parseTopUpWebhook(
      reference,
      payload,
    );

    const intent = await this.walletTopUpIntentRepository.findOne({
      where: { paystackReference: reference },
    });
    if (intent) {
      intent.webhookPayload = payload;
      intent.status = result.isSuccessful
        ? TopUpStatus.COMPLETED
        : TopUpStatus.FAILED;
      await this.walletTopUpIntentRepository.save(intent);
    }

    if (!result.isSuccessful) {
      this.logger.warn(`Top-up failed for ${reference}`);
      return;
    }

    const user = await this.userService.findById(result.userId);
    const walletId = user.wallets[result.currency];
    return this.fundWallet(walletId, result.amount, user.id);
  }

  async initiateCashout(
    userId: string,
    dto: WalletCashoutDto,
  ): Promise<WalletCashoutIntent> {
    const { amount, currency, bankAccountNumber, bankCode } = dto;

    const user = await this.userService.findById(userId);
    const walletId = user.wallets[dto.currency];
    const wallet = await this.findWalletById(walletId);
    const walletBalance = await this.getWalletBalance(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this currency');
    }

    if (walletBalance.availableBalance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const intent = this.walletCashoutIntentRepository.create({
      userId: user.id,
      amount,
      currency,
      bankAccountNumber,
      bankCode,
      status: CashoutStatus.PENDING,
    });
    await this.walletCashoutIntentRepository.save(intent);

    const paystackResponse = await this.paystackService.createPayout(
      bankAccountNumber,
      bankCode,
      amount,
      currency,
      intent.id,
    );

    intent.paystackReference = paystackResponse.data.reference;
    await this.walletCashoutIntentRepository.save(intent);

    return intent;
  }

  async processCashoutFromWebhook(reference: string, payload: any) {
    const result = await this.paystackService.parseCashoutWebhook(
      reference,
      payload,
    );

    const intent = await this.walletCashoutIntentRepository.findOne({
      where: { paystackReference: reference },
    });
    if (intent) {
      intent.webhookPayload = payload;
      intent.status = result.isSuccessful
        ? CashoutStatus.COMPLETED
        : CashoutStatus.FAILED;
      await this.walletCashoutIntentRepository.save(intent);
    }

    const user = await this.userService.findById(result.userId);
    const walletId = user.wallets[result.currency];
    const wallet = await this.findWalletById(walletId);

    if (!result.isSuccessful) {
      this.logger.warn(`Cashout failed for ${reference}`);
      await this.notificationService.sendWalletCashoutFailedNotificationEmail({
        userEmail: user.email,
        amount: result.amount,
        currency: result.currency,
        balanceAfter: (await this.getWalletBalance(walletId)).availableBalance,
        txId: reference,
        occurredAt: new Date(),
        reason: `Cashout failed with status: ${payload?.data?.status}`,
      });
      return;
    }

    let debitTx: Transaction;

    await this.dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);

      debitTx = transactionRepo.create({
        amount: result.amount,
        walletId,
        currency: wallet.currency,
        type: TransactionType.DEBIT,
        status: TransactionStatus.SUCCESSFUL,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { paystackReference: reference },
        idempotencyKey: uuidv4(),
      });
      await transactionRepo.save(debitTx);

      await this.adminAnalyticsService.recordTransaction(
        result.amount,
        manager,
        user.id,
        TransactionType.DEBIT,
        wallet.currency,
        debitTx.idempotencyKey,
      );

      await this.adminAnalyticsService.updateUserTransactionStats(
        user.id,
        result.amount,
        TransactionType.DEBIT,
        manager,
      );
    });

    await this.notificationService.sendWalletCashoutNotificationEmail({
      userEmail: user.email,
      amount: result.amount,
      currency: wallet.currency,
      balanceAfter: (await this.getWalletBalance(walletId)).availableBalance,
      txId: debitTx.id,
      occurredAt: new Date(),
    });

    return debitTx;
  }

  private async checkoutcreateAndRecordTransaction(
    manager: EntityManager,
    params: {
      amount: number;
      walletId: string;
      userId: string;
      currency: SupportedCurrencies;
      type: TransactionType;
      metadata?: any;
    },
  ): Promise<Transaction> {
    const transactionRepo = manager.getRepository(Transaction);

    const transaction = transactionRepo.create({
      amount: params.amount,
      walletId: params.walletId,
      currency: params.currency,
      type: params.type,
      status: TransactionStatus.SUCCESSFUL,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: params.metadata || {},
      idempotencyKey: uuidv4(),
    });

    await transactionRepo.save(transaction);

    await this.adminAnalyticsService.recordTransaction(
      params.amount,
      manager,
      params.userId,
      params.type,
      params.currency,
      transaction.idempotencyKey,
    );

    await this.adminAnalyticsService.updateUserTransactionStats(
      params.userId,
      params.amount,
      params.type,
      manager,
    );

    return transaction;
  }
}
