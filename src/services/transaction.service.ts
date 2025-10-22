import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvalidTransactionStatusTransitionException } from '../exceptions/invalid.transaction.status.transition.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
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

  async findTransactions(
    walletId: string,
    status?: string,
    currency?: string,
    sort: 'ASC' | 'DESC' = 'DESC',
    page = 1,
    limit = 20,
  ): Promise<Transaction[]> {
    const where: any = { walletId };

    if (status) where.status = status;
    if (currency) where.currency = currency;

    return this.transactionRepository.find({
      where,
      order: { createdAt: sort },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getUserTransactionHistory(
    user: any,
    status?: string,
    currency?: SupportedCurrencies,
    sort: 'ASC' | 'DESC' = 'DESC',
    page = 1,
    limit = 20,
  ): Promise<any[]> {
    const walletId = user.wallets?.[currency];

    if (!walletId) {
      throw new BadRequestException(`No wallet found for currency ${currency}`);
    }

    const transactions = await this.findTransactions(
      walletId,
      status,
      currency,
      sort,
      page,
      limit,
    );

    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const relatedTx = await this.transactionRepository.findOne({
          where: {
            idempotencyKey: tx.idempotencyKey,
            walletId: Not(tx.walletId),
          },
        });

        return {
          id: tx.id,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          type: tx.type,
          createdAt: tx.createdAt,
          sourceWalletId: tx.walletId,
          destinationWalletId: relatedTx?.walletId || null,
        };
      }),
    );

    return enrichedTransactions;
  }
}
