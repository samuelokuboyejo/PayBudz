import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { formatDateTime } from 'src/utils/date.util';
import { Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { UserService } from './user.service';
import { AdminUserProfileResponse } from 'src/user/dto/admin-user-profile.response';
import { UserTransactionStats } from '../entities/user-transaction-stats.entity';
import { TransactionEvent } from 'src/entities/transaction-event.entity';
import { FindTransactionsOptions } from 'src/interfaces/optional-user-parameter.interface';
import { Wallet } from 'src/entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(UserTransactionStats)
    private userTransactionStatsRepository: Repository<UserTransactionStats>,

    @InjectRepository(TransactionEvent)
    private transactionEventRepository: Repository<TransactionEvent>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,

    private walletService: WalletService,
    private userService: UserService,
  ) {}

  async getUserProfile(email: string): Promise<AdminUserProfileResponse> {
    const user = await this.userService.findByEmail(email);
    const walletId = user.wallets[SupportedCurrencies.NGN];
    const [wallet, walletBalanceDto, stats, lastTransaction] =
      await Promise.all([
        this.walletService.findWalletById(walletId),
        this.walletService.getWalletBalance(walletId),
        this.userTransactionStatsRepository.findOne({
          where: { userId: user.id },
        }),
        this.transactionEventRepository.findOne({
          where: { userId: user.id },
          order: { createdAt: 'DESC' },
        }),
      ]);

    const response: AdminUserProfileResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      username: user.username,
      joinDate: formatDateTime(user.createdAt),
      lastLogin: formatDateTime(user.lastLogin),
      walletid: walletId,
      balance: walletBalanceDto.availableBalance,
      lastTranstactionAt: formatDateTime(lastTransaction.createdAt),
      transactionCount: (await wallet).transactionCount,
      transactionValue: stats ? stats.totalVolume : 0,
    };
    return response;
  }

  async searchUser(query: string): Promise<AdminUserProfileResponse> {
    let user;

    if (isUUID(query)) {
      user = await this.userService.findById(query);

      if (!user) {
        user = await this.userService.findByWalletId(query);
      }
    } else if (query.includes('@')) {
      user = await this.userService.findByEmail(query);
    } else {
      user = await this.userService.findByUsername(query);
    }

    if (!user) {
      throw new Error('User not found with the provided query');
    }

    return this.getUserProfile(user.email);
  }

  async deactivateUserWallet(userId: string): Promise<Wallet> {
    const user = await this.userService.findById(userId);
    const walletId = user.wallets[SupportedCurrencies.NGN];
    return await this.walletService.deactivateWallet(walletId);
  }

  async reactivateUserWallet(userId: string): Promise<Wallet> {
    const user = await this.userService.findById(userId);
    const walletId = user.wallets[SupportedCurrencies.NGN];
    return await this.walletService.activateWallet(walletId);
  }

  async getTransactions(
    options: FindTransactionsOptions,
  ): Promise<Transaction[]> {
    const {
      userId,
      status,
      currency,
      type,
      fromDate,
      toDate,
      sort = 'DESC',
      page = 1,
      limit = 20,
    } = options;

    const user = await this.userService.findById(userId);
    const walletId = user.wallets[SupportedCurrencies.NGN];
    const query = this.transactionRepository

      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId });

    if (status) {
      query.andWhere('transaction.status = :status', { status });
    }

    if (currency) {
      query.andWhere('transaction.currency = :currency', { currency });
    }

    if (type) {
      query.andWhere('transaction.type = :type', { type });
    }

    if (fromDate) {
      query.andWhere('transaction.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('transaction.createdAt <= :toDate', { toDate });
    }

    query
      .orderBy('transaction.createdAt', sort)
      .skip((page - 1) * limit)
      .take(limit);

    return query.getMany();
  }
}
