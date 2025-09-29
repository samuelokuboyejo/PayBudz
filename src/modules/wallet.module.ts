import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from '../services/wallet.service';
import { WalletController } from '../controllers/wallet.controller';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { UserModule } from './user.module';
import { NotificationModule } from './notification.module';
import { WalletCashoutIntent } from 'src/entities/wallet-cashout-intent.entity';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { PaystackModule } from './paystack.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      Transaction,
      WalletCashoutIntent,
      WalletTopUpIntent,
    ]),
    UserModule,
    NotificationModule,
    PaystackModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService, TypeOrmModule],
})
export class WalletModule {}
