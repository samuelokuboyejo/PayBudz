/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { CreateWalletDto } from '../dto/wallet.dto';
import { WalletBalanceDto } from 'src/dto/wallet-balance.dto';
import { SupportedCurrencies } from '../enums/currency.enum';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionStatus } from 'src/enums/transaction-status.enum';
import { TransactionType } from 'src/enums/transaction-type.enum';
import { UserService } from './user.service';
import { NotificationService } from './notification.service';

@Injectable()
export class WalletService {
  private logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private userService: UserService,
    private notificationService: NotificationService,
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

    const creditTransaction = await this.dataSource.transaction(
      async (manager) => {
        const transactionRepo = manager.getRepository(Transaction);

        const tx = transactionRepo.create({
          amount,
          walletId: wallet.id,
          currency: wallet.currency as SupportedCurrencies,
          type: TransactionType.CREDIT,
          status: TransactionStatus.SUCCESSFUL,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return transactionRepo.save(tx);
      },
    );

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
}
