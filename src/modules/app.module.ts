/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallet.module';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionModule } from './transaction.module';
import { TransferModule } from './transfer.module';
import { Transfer } from 'src/entities/transfer.entity';
import { UserModule } from 'src/modules/user.module';
import { AppService } from 'src/services/app.service';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/controllers/app.controller';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/modules/auth.module';
import { MailModule } from './mail.module';
import { NotificationModule } from './notification.module';
import { SlackNotificationModule } from './slack-notification.module';
import { CustomMigrationService } from 'src/migrations/custom.migrations';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { PaystackModule } from './paystack.module';
import { WalletCashoutIntent } from 'src/entities/wallet-cashout-intent.entity';
import { WebhookModule } from './webhook.module';
import { AdminAnalyticsModule } from './admin-analytics.module';
import { AdminAnalytics } from 'src/entities/admin-analytics.entity';
import { UserSignupEvent } from 'src/entities/user-sign-up-event.entity';
import { UserTransactionStats } from 'src/entities/user-transaction-stats.entity';
import { TransactionEvent } from 'src/entities/transaction-event.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ListenersModule } from './listeners.module';
import { AdminUserModule } from './admin-user-mgt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          Wallet,
          Transaction,
          Transfer,
          User,
          WalletTopUpIntent,
          WalletCashoutIntent,
          AdminAnalytics,
          UserSignupEvent,
          UserTransactionStats,
          TransactionEvent,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        schema: 'public',
      }),
      inject: [ConfigService],
    }),
    WalletModule,
    TransactionModule,
    TransferModule,
    UserModule,
    AuthModule,
    MailModule,
    NotificationModule,
    SlackNotificationModule,
    PaystackModule,
    WebhookModule,
    PaystackModule,
    WebhookModule,
    AdminAnalyticsModule,
    ListenersModule,
    AdminUserModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomMigrationService, FirebaseAuthGuard],
})
export class AppModule {}
