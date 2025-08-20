import { Injectable, NotFoundException } from '@nestjs/common';
import { InvalidTransactionStatusTransitionException } from '../exceptions/invalid.transaction.status.transition.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { Transaction } from 'src/entities/transaction.entity';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { TransactionType } from 'src/enums/transaction-type.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  TransactionStatusTransitions: Record<TransactionStatus, TransactionStatus[]> =
    {
      [TransactionStatus.PENDING]: [
        TransactionStatus.SUCCESSFUL,
        TransactionStatus.FAILED,
      ],
      [TransactionStatus.SUCCESSFUL]: [],
      [TransactionStatus.FAILED]: [],
    };

  async createTransaction(
    amount: number,
    walletId: string,
    currency: SupportedCurrencies,
    transactionType: TransactionType,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      amount,
      currency,
      walletId,
      type: transactionType,
      status: TransactionStatus.PENDING,
    });
    return this.transactionRepository.save(transaction);
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('transaction not found');
    }

    return transaction;
  }

  async updateTransactionStatus(
    id: string,
    newStatus: TransactionStatus,
  ): Promise<Transaction> {
    const transaction = await this.findById(id);
    const fromStatus = transaction.status;
    const allowed = this.TransactionStatusTransitions[fromStatus];
    if (!allowed.includes(newStatus)) {
      throw new InvalidTransactionStatusTransitionException(
        fromStatus,
        newStatus,
      );
    }
    transaction.status = newStatus;
    transaction.updatedAt = new Date();
    return this.transactionRepository.save(transaction);
  }
}
