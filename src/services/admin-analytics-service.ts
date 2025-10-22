import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAnalyticsResponse } from 'src/dto/admin-analytics-response';
import { formatDateTime } from 'src/utils/date.util';
import { AdminAnalytics } from 'src/entities/admin-analytics.entity';
import { UserTransactionStats } from 'src/entities/user-transaction-stats.entity';
import { TransactionType } from 'src/enums/transaction-type.enum';
import { UserSignupEvent } from 'src/entities/user-sign-up-event.entity';
import { TransactionEvent } from 'src/entities/transaction-event.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { NewUsersResponse } from '../dto/new-users-response';
import { TransactionVolumeResponse } from 'src/dto/transaction-volume-response';

export class AdminAnalyticsService {
  constructor(
    @InjectRepository(AdminAnalytics)
    private analyticsRepository: Repository<AdminAnalytics>,
    @InjectRepository(UserTransactionStats)
    private userTransactionStatsRepository: Repository<UserTransactionStats>,
    @InjectRepository(UserSignupEvent)
    private userSignupEventRepository: Repository<UserSignupEvent>,
    @InjectRepository(TransactionEvent)
    private transactionEventRepository: Repository<TransactionEvent>,
  ) {}

  private async getSnapshot(manager?: EntityManager): Promise<AdminAnalytics> {
    const repo = manager
      ? manager.getRepository(AdminAnalytics)
      : this.analyticsRepository;
    let snapshot = await repo.findOneBy({});
    if (!snapshot) {
      snapshot = repo.create();
      await repo.save(snapshot);
    }
    return snapshot;
  }

  async incrementUsers(manager: EntityManager) {
    const repo = manager.getRepository(AdminAnalytics);
    const snapshot = await this.getSnapshot(manager);
    snapshot.totalUsers += 1;
    snapshot.updatedAt = new Date();
    await repo.save(snapshot);
  }

  async markWalletActive(walletId: string, manager: EntityManager) {
    const transactionRepo = manager.getRepository(Transaction);
    const count = await transactionRepo.count({ where: { walletId } });

    if (count === 1) {
      await this.incrementActiveWallets(manager);
    }
  }

  async incrementActiveWallets(manager: EntityManager) {
    const repo = manager.getRepository(AdminAnalytics);
    const snapshot = await this.getSnapshot(manager);

    snapshot.activeWallets += 1;
    snapshot.updatedAt = new Date();

    await repo.save(snapshot);
  }

  async recordTransaction(
    amount: number,
    manager: EntityManager,
    userId: string,
    type: TransactionType,
    currency: string,
    idempotencyKey: string,
  ) {
    const repository = manager.getRepository(AdminAnalytics);
    const eventRepository = manager.getRepository(TransactionEvent);

    const snapshot = await this.getSnapshot(manager);
    const amountInKobo = Math.round(amount * 100);
    const currentValue = Number(snapshot.totalTransactionValue) || 0;
    snapshot.totalTransactionValue = currentValue + amountInKobo;
    snapshot.totalTransactionCount += 1;
    snapshot.lastTransaction = new Date();
    snapshot.updatedAt = new Date();
    await repository.save(snapshot);

    const event = eventRepository.create({
      userId,
      amount: amountInKobo,
      type,
      currency,
      idempotencyKey,
    });
    await eventRepository.save(event);
  }

  async updateUserTransactionStats(
    userId: string,
    amount: number,
    type: TransactionType,
    manager: EntityManager,
  ) {
    const repo = manager.getRepository(UserTransactionStats);

    let stats = await repo.findOne({ where: { userId } });

    if (!stats) {
      stats = repo.create({
        userId,
        totalCredit: type === TransactionType.CREDIT ? amount : 0,
        totalDebit: type === TransactionType.DEBIT ? amount : 0,
        totalVolume: amount,
      });
    } else {
      if (type === TransactionType.CREDIT) {
        stats.totalCredit = Number(stats.totalCredit) + amount;
      } else if (type === TransactionType.DEBIT) {
        stats.totalDebit = Number(stats.totalDebit) + amount;
      }
      stats.totalVolume = Number(stats.totalVolume) + amount;
    }

    await repo.save(stats);
  }

  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    const snapshot = await this.getSnapshot();

    return {
      totalTransactionValue: snapshot.totalTransactionValue / 100,
      totalTransactionCount: snapshot.totalTransactionCount,
      totalUsers: snapshot.totalUsers,
      activeWallets: snapshot.activeWallets,
      revenue: snapshot.revenue / 100,
      lastTransaction: snapshot.lastTransaction
        ? formatDateTime(snapshot.lastTransaction)
        : null,
    };
  }

  async getTopUsersByTransactionValue(limit = 10) {
    const stats = await this.userTransactionStatsRepository.find();
    return stats.sort((a, b) => b.totalVolume - a.totalVolume).slice(0, limit);
  }

  async getNewUsersOverTime(): Promise<NewUsersResponse[]> {
    const events = await this.userSignupEventRepository.find();
    const grouped = new Map<string, string[]>();

    for (const event of events) {
      const day = event.createdAt.toISOString().split('T')[0];
      const users = grouped.get(day) || [];
      users.push(event.userId);
      grouped.set(day, users);
    }

    return Array.from(grouped.entries()).map(([date, userIds]) => ({
      date,
      userIds,
      count: userIds.length,
    }));
  }

  async getTransactionVolumeOverTime(): Promise<TransactionVolumeResponse[]> {
    const events = await this.transactionEventRepository.find();
    const dailyStats: Record<
      string,
      {
        debitTotal: number;
        creditTotal: number;
        totalValue: number;
        count: number;
      }
    > = {};

    for (const event of events) {
      const date = event.createdAt.toISOString().split('T')[0];

      if (!dailyStats[date]) {
        dailyStats[date] = {
          debitTotal: 0,
          creditTotal: 0,
          totalValue: 0,
          count: 0,
        };
      }

      const amount = Number(event.amount) / 100;

      if (event.type === TransactionType.DEBIT)
        dailyStats[date].debitTotal += amount;
      if (event.type === TransactionType.CREDIT)
        dailyStats[date].creditTotal += amount;

      dailyStats[date].totalValue += amount;
      dailyStats[date].count += 1;
    }

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }
}
