import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionType } from 'src/enums/transaction-type.enum';
import { AdminAnalyticsService } from 'src/services/admin-analytics-service';

@Injectable()
export class AnalyticsListener {
  constructor(private adminAnalyticsService: AdminAnalyticsService) {}

  @OnEvent('transfer.completed', { async: true })
  async handleAnalyticsEvent(payload: {
    amount: number;
    sourceUser: { id: string };
    destinationUser: { id: string };
    sourceWallet: { id: string; currency: string };
    destinationWallet: { id: string; currency: string };
    idempotencyKey: string;
  }) {
    const {
      amount,
      sourceUser,
      destinationUser,
      sourceWallet,
      destinationWallet,
      idempotencyKey,
    } = payload;

    await this.adminAnalyticsService.recordTransaction(
      amount,
      this.adminAnalyticsService['analyticsRepository'].manager,
      sourceUser.id,
      TransactionType.DEBIT,
      sourceWallet.currency,
      idempotencyKey,
    );

    await this.adminAnalyticsService.recordTransaction(
      amount,
      this.adminAnalyticsService['analyticsRepository'].manager,
      destinationUser.id,
      TransactionType.CREDIT,
      destinationWallet.currency,
      idempotencyKey,
    );

    await this.adminAnalyticsService.updateUserTransactionStats(
      sourceUser.id,
      amount,
      TransactionType.DEBIT,
      this.adminAnalyticsService['analyticsRepository'].manager,
    );

    await this.adminAnalyticsService.updateUserTransactionStats(
      destinationUser.id,
      amount,
      TransactionType.CREDIT,
      this.adminAnalyticsService['analyticsRepository'].manager,
    );

    await this.adminAnalyticsService.markWalletActive(
      sourceWallet.id,
      this.adminAnalyticsService['analyticsRepository'].manager,
    );
    await this.adminAnalyticsService.markWalletActive(
      destinationWallet.id,
      this.adminAnalyticsService['analyticsRepository'].manager,
    );
  }
}
