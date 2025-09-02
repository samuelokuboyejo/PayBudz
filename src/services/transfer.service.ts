import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransferDto } from 'src/dto/transfer.dto';
import { Transaction } from 'src/entities/transaction.entity';
import { Transfer } from 'src/entities/transfer.entity';
import { Repository, DataSource } from 'typeorm';
import { WalletService } from './wallet.service';
import { TransactionType } from 'src/enums/transaction-type.enum';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { TransactionStatus } from 'src/enums/transaction-status.enum';
import Decimal from 'decimal.js';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,

    private dataSource: DataSource,
    private walletService: WalletService,
  ) {}

  async findTransferById(id: string): Promise<Transfer> {
    const transfer = await this.transferRepository.findOne({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    return transfer;
  }

  async findTransfersByWalletId(walletId: string): Promise<Transfer[]> {
    const transfers = await this.transferRepository.find({
      where: [{ fromWalletId: walletId }, { toWalletId: walletId }],
    });

    if (!transfers || transfers.length === 0) {
      throw new NotFoundException(
        `No transfers found for wallet ID ${walletId}`,
      );
    }

    return transfers;
  }

  async transfer(dto: TransferDto): Promise<Transfer> {
    const destinationWallet = await this.walletService.findWalletById(
      dto.destinationWalletId,
    );

    const sourceWallet = await this.walletService.findWalletById(
      dto.sourceWalletId,
    );

    if (!sourceWallet.isActive || !destinationWallet.isActive) {
      throw new BadRequestException('One or both wallets are inactive');
    }

    const balance = await this.walletService.getWalletBalance(
      dto.sourceWalletId,
    );
    if (new Decimal(balance.availableBalance).lt(new Decimal(dto.amount))) {
      throw new BadRequestException('Insufficient funds');
    }

    if (sourceWallet.currency !== destinationWallet.currency) {
      throw new BadRequestException(
        'Transfers can only be made between wallets of the same currency',
      );
    }
    return this.dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);
      const transferRepo = manager.getRepository(Transfer);

      const createTransaction = async (
        amount: number,
        walletId: string,
        currency: SupportedCurrencies,
        type: TransactionType,
      ): Promise<Transaction> => {
        const transaction = transactionRepo.create({
          amount,
          walletId,
          currency,
          type,
          status: TransactionStatus.SUCCESSFUL,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return transactionRepo.save(transaction);
      };

      const debitTransaction = await createTransaction(
        dto.amount,
        sourceWallet.id,
        sourceWallet.currency as SupportedCurrencies,
        TransactionType.DEBIT,
      );

      const creditTransaction = await createTransaction(
        dto.amount,
        destinationWallet.id,
        destinationWallet.currency as SupportedCurrencies,
        TransactionType.CREDIT,
      );

      const transfer = transferRepo.create({
        amount: dto.amount,
        fromWalletId: sourceWallet.id,
        toWalletId: destinationWallet.id,
        debitTransactionId: debitTransaction.id,
        creditTransactionId: creditTransaction.id,
        currencyCode: sourceWallet.currency,
        idempotencyKey: dto.idempotencyKey,
        createdAt: new Date(),
      });

      return transferRepo.save(transfer);
    });
  }
}
