import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserController } from 'src/controllers/admin-user.controller';
import { TransactionEvent } from 'src/entities/transaction-event.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { UserTransactionStats } from 'src/entities/user-transaction-stats.entity';
import { AdminUserService } from 'src/services/admin-user.service';
import { WalletModule } from './wallet.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTransactionStats,
      TransactionEvent,
      Transaction,
    ]),
    WalletModule,
    UserModule,
  ],
  providers: [AdminUserService],
  controllers: [AdminUserController],
  exports: [AdminUserService],
})
export class AdminUserModule {}
