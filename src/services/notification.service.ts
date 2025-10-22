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
  WalletCashoutFailedNotificationParams,
  LoginAlertNotificationParams,
} from 'src/utils/notification-types';
import { WalletCashoutFailedTemplate } from 'src/mail/templates/wallet-cashout-failed.template';
import { LoginAlertTemplate } from 'src/mail/templates/login.template';
import { WalletActivatedTemplate } from 'src/mail/templates/wallet-activated.template';

@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailService) {}

  async sendWelcomeEmail(userEmail: string, firstName: string) {
    return this.mailService.sendMail(userEmail, WelcomeTemplate, {
      firstName,
    });
  }

  async sendWalletActivationEmail(userEmail: string, firstName: string) {
    return this.mailService.sendMail(userEmail, WalletActivatedTemplate, {
      firstName,
    });
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
      formattedDateTime: formatDateTime(occurredAt),
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
      occurredAt: formatDateTime(occurredAt),
    });
  }

  async sendWalletCashoutFailedNotificationEmail(
    params: WalletCashoutFailedNotificationParams,
  ) {
    const {
      userEmail,
      amount,
      currency,
      balanceAfter,
      txId,
      occurredAt,
      reason,
    } = params;

    return this.mailService.sendMail(userEmail, WalletCashoutFailedTemplate, {
      amount: formatSignedAmount(amount, currency, false),
      currency,
      balanceAfter: formatCurrency(balanceAfter, currency),
      txId,
      occurredAt: formatDateTime(occurredAt),
      reason,
    });
  }

  async sendLoginAlertNotificationEmail(params: LoginAlertNotificationParams) {
    const { userEmail, firstName, deviceInfo, location, loginTime } = params;

    return this.mailService.sendMail(userEmail, LoginAlertTemplate, {
      firstName,
      deviceInfo,
      location,
      loginTime: formatDateTime(loginTime),
    });
  }
}
