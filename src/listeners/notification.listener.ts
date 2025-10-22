import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SlackNotificationService } from 'src/services/slack-notification.service';
import { WalletService } from 'src/services/wallet.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private slackNotificationService: SlackNotificationService,
    private walletService: WalletService,
    private notificationService: NotificationService,
  ) {}

  @OnEvent('transfer.completed', { async: true })
  async handleTransferNotifications(payload: any) {
    const {
      amount,
      sourceWallet,
      destinationWallet,
      transfer,
      debitTransaction,
      creditTransaction,
      sourceUser,
      destinationUser,
    } = payload;

    try {
      await this.slackNotificationService.sendTransactionSuccess({
        type: 'TRANSFER',
        amount,
        currency: sourceWallet.currency,
        sender: sourceUser.username,
        recipient: destinationUser.username,
        reference: transfer.id,
      });

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
        debitAmount: amount,
        currency: sourceWallet.currency,
        updatedBalance: balanceAfterDebit.availableBalance,
        transactionId: debitTransaction.id,
        occurredAt: debitTransaction.createdAt,
      });

      await this.notificationService.sendWalletCreditNotificationEmail({
        userEmail: destinationUser.email.trim(),
        recipientName: `${destinationUser.firstName} ${destinationUser.lastName}`,
        senderUsername: sourceUser.username,
        creditAmount: amount,
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
  }
}
