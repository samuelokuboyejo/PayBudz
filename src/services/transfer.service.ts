import {
  BadRequestException,
  Injectable,
  Logger,
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
import { NotificationService } from './notification.service';
import { UserService } from './user.service';
import { SlackNotificationService } from './slack-notification.service';

@Injectable()
export class TransferService {
  private logger = new Logger(TransferService.name);

  constructor(
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,

    private dataSource: DataSource,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private userService: UserService,
    private slackNotificationService: SlackNotificationService,
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

  async transfer(sourceUserId: string, dto: TransferDto): Promise<Transfer> {
    const sourceUser = await this.userService.findById(sourceUserId);

    const sourceWalletId = sourceUser.wallets[dto.currency];
    if (!sourceWalletId) {
      throw new NotFoundException('Source wallet not found for this currency');
    }
    const sourceWallet = await this.walletService.findWalletById(
      sourceWalletId,
    );

    const destinationUser = await this.userService.findByUsername(
      dto.destinationUsername,
    );
    if (!destinationUser) {
      throw new NotFoundException('Destination user not found');
    }
    const destinationWalletId = destinationUser.wallets[dto.currency];

    const destinationWallet = await this.walletService.findWalletById(
      destinationWalletId,
    );

    if (!sourceWallet.isActive || !destinationWallet.isActive) {
      throw new BadRequestException('One or both wallets are inactive');
    }

    const balance = await this.walletService.getWalletBalance(sourceWallet.id);
    if (new Decimal(balance.availableBalance).lt(new Decimal(dto.amount))) {
      throw new BadRequestException('Insufficient funds');
    }

    if (sourceWallet.currency !== destinationWallet.currency) {
      throw new BadRequestException(
        'Transfers can only be made between wallets of the same currency',
      );
    }

    let debitTransaction: Transaction;
    let creditTransaction: Transaction;
    let transfer: Transfer;

    await this.dataSource.transaction(async (manager) => {
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

      debitTransaction = await createTransaction(
        dto.amount,
        sourceWallet.id,
        sourceWallet.currency as SupportedCurrencies,
        TransactionType.DEBIT,
      );

      creditTransaction = await createTransaction(
        dto.amount,
        destinationWallet.id,
        destinationWallet.currency as SupportedCurrencies,
        TransactionType.CREDIT,
      );

      transfer = transferRepo.create({
        amount: dto.amount,
        fromWalletId: sourceWallet.id,
        toWalletId: destinationWallet.id,
        debitTransactionId: debitTransaction.id,
        creditTransactionId: creditTransaction.id,
        currencyCode: sourceWallet.currency,
        idempotencyKey: dto.idempotencyKey,
        createdAt: new Date(),
      });

      await transferRepo.save(transfer);
    });

    await this.slackNotificationService.sendTransactionSuccess({
      type: 'TRANSFER',
      amount: dto.amount,
      currency: sourceWallet.currency,
      sender: sourceUser.username,
      recipient: destinationUser.username,
      reference: transfer.id,
    });

    try {
      const balanceAfterDebit = await this.walletService.getWalletBalance(
        sourceWallet.id,
      );
      const balanceAfterCredit = await this.walletService.getWalletBalance(
        destinationWallet.id,
      );

      await this.notificationService.sendWalletDebitNotificationEmail({
        userEmail: sourceUser.email.trim(),
        recipientName: `${sourceUser.firstName} ${sourceUser.lastName}`,
        beneficiaryUsername: destinationUser.username,
        debitAmount: dto.amount,
        currency: sourceWallet.currency,
        updatedBalance: balanceAfterDebit.availableBalance,
        transactionId: debitTransaction.id,
        occurredAt: debitTransaction.createdAt,
      });

      await this.notificationService.sendWalletCreditNotificationEmail({
        userEmail: destinationUser.email.trim(),
        recipientName: `${destinationUser.firstName} ${destinationUser.lastName}`,
        senderUsername: sourceUser.username,
        creditAmount: dto.amount,
        currency: destinationWallet.currency,
        updatedBalance: balanceAfterCredit.availableBalance,
        transactionId: creditTransaction.id,
        occurredAt: creditTransaction.createdAt,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send transfer notification for transferId=${transfer.id}: ${err.message}`,
      );
    }

    return transfer;
  }
}
