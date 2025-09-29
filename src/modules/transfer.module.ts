import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferController } from 'src/controllers/transfer.controller';
import { Transaction } from 'src/entities/transaction.entity';
import { Transfer } from 'src/entities/transfer.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { TransactionService } from 'src/services/transaction.service';
import { TransferService } from 'src/services/transfer.service';
import { WalletService } from 'src/services/wallet.service';
import { UserModule } from './user.module';
import { NotificationModule } from './notification.module';
import { SlackNotificationModule } from './slack-notification.module';
import { WalletModule } from './wallet.module';
import { PaymentModule } from './payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, Transaction, Wallet]),
    UserModule,
    NotificationModule,
    SlackNotificationModule,
    WalletModule,
    PaymentModule,
  ],
  controllers: [TransferController],
  providers: [TransferService, TransactionService, WalletService],
  exports: [TransferService],
})
export class TransferModule {}
