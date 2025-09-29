import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from 'src/controllers/transactions.controller';
import { Transaction } from 'src/entities/transaction.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { TransactionService } from 'src/services/transaction.service';
import { WalletService } from 'src/services/wallet.service';
import { UserModule } from './user.module';
import { NotificationModule } from './notification.module';
import { WalletCashoutIntent } from 'src/entities/wallet-cashout-intent.entity';
import { PaystackService } from 'src/services/paystack.service';
import { PaymentModule } from './payment.module';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from 'src/services/webhook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Wallet,
      WalletCashoutIntent,
      WalletTopUpIntent,
    ]),
    UserModule,
    NotificationModule,
    PaymentModule,
    HttpModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, WalletService, PaystackService],
  exports: [TransactionService],
})
export class TransactionModule {}
