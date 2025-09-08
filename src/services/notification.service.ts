import { Injectable } from '@nestjs/common';
import { WelcomeTemplate } from '../mail/templates/welcome.template';
import { MailService } from './mail.service';
import { WalletTopupTemplate } from 'src/mail/templates/wallet-topup.template';
import { WalletCreditedTemplate } from 'src/mail/templates/wallet-credited.template';
import { WalletDebitedTemplate } from 'src/mail/templates/wallet-debited.template';
import { WalletCashoutTemplate } from 'src/mail/templates/wallet-cashout.template';
import { formatCurrency, formatSignedAmount } from 'src/utils/currency.util';
import { formatDateTime } from 'src/utils/date.util';
import {
  WalletTopupNotificationParams,
  WalletCreditNotificationParams,
  WalletDebitNotificationParams,
  WalletCashoutNotificationParams,
} from 'src/utils/notification-types';

@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailService) {}

  async sendWelcomeEmail(userEmail: string, firstName: string) {
    return this.mailService.sendMail(userEmail, WelcomeTemplate, { firstName });
  }

  async sendWalletTopupNotificationEmail(
    params: WalletTopupNotificationParams,
  ) {
    const { userEmail, amount, currency, balanceAfter, txId, occurredAt } =
      params;

    return this.mailService.sendMail(userEmail, WalletTopupTemplate, {
      amount: formatSignedAmount(amount, currency, true),
      currency,
      balanceAfter: formatCurrency(balanceAfter, currency),
      txId,
      occurredAt,
    });
  }

  async sendWalletCreditNotificationEmail(
    params: WalletCreditNotificationParams,
  ) {
    const {
      userEmail,
      recipientName,
      senderUsername,
      creditAmount,
      currency,
      updatedBalance,
      transactionId,
      occurredAt,
    } = params;

    return this.mailService.sendMail(userEmail, WalletCreditedTemplate, {
      recipientName,
      senderUsername,
      creditAmount: formatSignedAmount(creditAmount, currency, true),
      currency,
      updatedBalance: formatCurrency(updatedBalance, currency),
      transactionId,
      formattedDateTime: formatDateTime(occurredAt),
    });
  }

  async sendWalletDebitNotificationEmail(
    params: WalletDebitNotificationParams,
  ) {
    const {
      userEmail,
      recipientName,
      beneficiaryUsername,
      debitAmount,
      currency,
      updatedBalance,
      transactionId,
      occurredAt,
    } = params;

    return this.mailService.sendMail(userEmail, WalletDebitedTemplate, {
      recipientName,
      beneficiaryUsername,
      debitAmount: formatSignedAmount(debitAmount, currency, false),
      currency,
      updatedBalance: formatCurrency(updatedBalance, currency),
      transactionId,
      formattedDateTime: formatDateTime(occurredAt),
    });
  }

  async sendWalletCashoutNotificationEmail(
    params: WalletCashoutNotificationParams,
  ) {
    const { userEmail, amount, currency, balanceAfter, txId, occurredAt } =
      params;

    return this.mailService.sendMail(userEmail, WalletCashoutTemplate, {
      amount: formatSignedAmount(amount, currency, false),
      currency,
      balanceAfter: formatCurrency(balanceAfter, currency),
      txId,
      occurredAt,
    });
  }
}
