import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from 'src/services/notification.service';
import { MailService } from 'src/services/mail.service';
import { formatCurrency, formatSignedAmount } from 'src/utils/currency.util';
import { formatDateTime } from 'src/utils/date.util';
import {
  WalletTopupNotificationParams,
  WalletCreditNotificationParams,
  WalletDebitNotificationParams,
  WalletCashoutNotificationParams,
} from 'src/utils/notification-types';

describe('NotificationService', () => {
  let service: NotificationService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    mailService = module.get(MailService);
  });

  describe('sendWalletTopupNotificationEmail', () => {
    it('should call mailService.sendMail with correct params', async () => {
      const params: WalletTopupNotificationParams = {
        userEmail: 'test@example.com',
        amount: 100,
        currency: 'USD',
        balanceAfter: 200,
        txId: 'tx123',
        occurredAt: '2025-09-04T10:00:00Z',
      };

      await service.sendWalletTopupNotificationEmail(params);

      expect(mailService.sendMail).toHaveBeenCalledWith(
        'test@example.com',
        expect.anything(),
        {
          amount: formatSignedAmount(100, 'USD', true),
          currency: 'USD',
          balanceAfter: formatCurrency(200, 'USD'),
          txId: 'tx123',
          occurredAt: '2025-09-04T10:00:00Z',
        },
      );
    });
  });

  describe('sendWalletCreditNotificationEmail', () => {
    it('should call mailService.sendMail with correct params', async () => {
      const occurredAt = new Date();
      const params: WalletCreditNotificationParams = {
        userEmail: 'john@example.com',
        recipientName: 'John Doe',
        senderUsername: 'jane_doe',
        creditAmount: 150,
        currency: 'USD',
        updatedBalance: 350,
        transactionId: 'TX12345',
        occurredAt,
      };

      await service.sendWalletCreditNotificationEmail(params);

      expect(mailService.sendMail).toHaveBeenCalledWith(
        'john@example.com',
        expect.anything(),
        {
          recipientName: 'John Doe',
          senderUsername: 'jane_doe',
          creditAmount: formatSignedAmount(150, 'USD', true),
          currency: 'USD',
          updatedBalance: formatCurrency(350, 'USD'),
          transactionId: 'TX12345',
          formattedDateTime: formatDateTime(occurredAt),
        },
      );
    });
  });

  describe('sendWalletDebitNotificationEmail', () => {
    it('should call mailService.sendMail with correct params', async () => {
      const occurredAt = new Date();
      const params: WalletDebitNotificationParams = {
        userEmail: 'john@example.com',
        recipientName: 'John Doe',
        beneficiaryUsername: 'jane_doe',
        debitAmount: 100,
        currency: 'USD',
        updatedBalance: 250,
        transactionId: 'tx789',
        occurredAt,
      };

      await service.sendWalletDebitNotificationEmail(params);

      expect(mailService.sendMail).toHaveBeenCalledWith(
        'john@example.com',
        expect.anything(),
        {
          recipientName: 'John Doe',
          beneficiaryUsername: 'jane_doe',
          debitAmount: formatSignedAmount(100, 'USD', false),
          currency: 'USD',
          updatedBalance: formatCurrency(250, 'USD'),
          transactionId: 'tx789',
          formattedDateTime: formatDateTime(occurredAt),
        },
      );
    });
  });

  describe('sendWalletCashoutNotificationEmail', () => {
    it('should call mailService.sendMail with correct params', async () => {
      const params: WalletCashoutNotificationParams = {
        userEmail: 'test@example.com',
        amount: 300,
        currency: 'USD',
        balanceAfter: 700,
        txId: 'tx999',
        occurredAt: '2025-09-04T10:03:00Z',
      };

      await service.sendWalletCashoutNotificationEmail(params);

      expect(mailService.sendMail).toHaveBeenCalledWith(
        'test@example.com',
        expect.anything(),
        {
          amount: formatSignedAmount(300, 'USD', false),
          currency: 'USD',
          balanceAfter: formatCurrency(700, 'USD'),
          txId: 'tx999',
          occurredAt: '2025-09-04T10:03:00Z',
        },
      );
    });
  });
});
