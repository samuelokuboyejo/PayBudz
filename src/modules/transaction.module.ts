import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { TransactionService } from 'src/services/transaction.service';
import { WalletService } from 'src/services/wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet])],
  controllers: [],
  providers: [TransactionService, WalletService],
  exports: [TransactionService],
})
export class TransactionModule {}
