import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAnalyticsService } from 'src/services/admin-analytics-service';
import { Module } from '@nestjs/common';
import { Transaction } from 'src/entities/transaction.entity';
import { AdminController } from '../controllers/admin.controller';
import { AdminAnalytics } from 'src/entities/admin-analytics.entity';
import { UserTransactionStats } from 'src/entities/user-transaction-stats.entity';
import { UserSignupEvent } from 'src/entities/user-sign-up-event.entity';
import { TransactionEvent } from 'src/entities/transaction-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      AdminAnalytics,
      UserTransactionStats,
      UserSignupEvent,
      TransactionEvent,
    ]),
  ],
  providers: [AdminAnalyticsService],
  controllers: [AdminController],
  exports: [AdminAnalyticsService, TypeOrmModule],
})
export class AdminAnalyticsModule {}
