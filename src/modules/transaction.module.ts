import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from 'src/controllers/transactions.controller';
import { Transaction } from 'src/entities/transaction.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { TransactionService } from 'src/services/transaction.service';
import { WalletService } from 'src/services/wallet.service';
import { UserModule } from './user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet]), UserModule],
  controllers: [TransactionController],
  providers: [TransactionService, WalletService],
  exports: [TransactionService],
})
export class TransactionModule {}
