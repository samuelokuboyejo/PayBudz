import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../src/services/notification.service';
import { MailService } from '../../src/services/mail.service';
import { WelcomeTemplate } from '../../src//mail/templates/welcome.template';
import { WalletTopupTemplate } from '../../src//mail/templates/wallet-topup.template';
import { WalletCreditedTemplate } from '../../src//mail/templates/wallet-credited.template';
import { WalletDebitedTemplate } from '../../src//mail/templates/wallet-debited.template';
import { WalletCashoutTemplate } from '../../src//mail/templates/wallet-cashout.template';

describe('NotificationService', () => {
  let service: NotificationService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: MailService,
          useValue: { sendMail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    mailService = module.get<MailService>(MailService);
  });

  it('should send welcome email', async () => {
    await service.sendWelcomeEmail('test@example.com', 'John');
    expect(mailService.sendMail).toHaveBeenCalledWith(
      'test@example.com',
      WelcomeTemplate,
      { firstName: 'John' },
    );
  });

  it('should send wallet topup email', async () => {
    const params = {
      userEmail: 'test@example.com',
      amount: 100,
      currency: 'USD',
      balanceAfter: 500,
      txId: 'tx123',
      occurredAt: new Date('2025-09-04T10:00:00Z'),
    };

    await service.sendWalletTopupNotificationEmail(params);

    expect(mailService.sendMail).toHaveBeenCalledWith(
      'test@example.com',
      WalletTopupTemplate,
      expect.objectContaining({
        amount: '+$100',
        currency: 'USD',
        balanceAfter: '$500',
        txId: 'tx123',
        occurredAt: expect.any(Date),
      }),
    );
  });

  it('should send wallet credit email', async () => {
    const occurredAt = new Date('2025-09-04T10:01:00Z');
    const params = {
      userEmail: 'test@example.com',
      recipientName: 'John',
      senderUsername: 'pointdex123',
      creditAmount: 500,
      currency: 'NGN',
      updatedBalance: 1000,
      transactionId: 'TX12345',
      occurredAt,
    };

    await service.sendWalletCreditNotificationEmail(params);

    const [to, template, payload] = (mailService.sendMail as jest.Mock).mock
      .calls[0];

    expect(to).toBe('test@example.com');
    expect(template).toBe(WalletCreditedTemplate);
    expect(payload.recipientName).toBe('John');
    expect(payload.senderUsername).toBe('pointdex123');
    expect(payload.currency).toBe('NGN');
    expect(payload.transactionId).toBe('TX12345');
  });

  it('should send wallet debit email', async () => {
    const occurredAt = new Date('2025-09-04T10:02:00Z');
    const params = {
      userEmail: 'test@example.com',
      recipientName: 'John',
      beneficiaryUsername: 'jane_doe',
      debitAmount: 50,
      currency: 'USD',
      updatedBalance: 650,
      transactionId: 'tx789',
      occurredAt,
    };

    await service.sendWalletDebitNotificationEmail(params);

    expect(mailService.sendMail).toHaveBeenCalledWith(
      'test@example.com',
      WalletDebitedTemplate,
      expect.objectContaining({
        recipientName: 'John',
        beneficiaryUsername: 'jane_doe',
        debitAmount: '-$50',
        currency: 'USD',
        updatedBalance: '$650',
        transactionId: 'tx789',
        formattedDateTime: expect.any(String),
      }),
    );
  });

  it('should send wallet cashout email', async () => {
    const params = {
      userEmail: 'test@example.com',
      amount: 300,
      currency: 'USD',
      balanceAfter: 350,
      txId: 'tx999',
      occurredAt: new Date(),
    };

    await service.sendWalletCashoutNotificationEmail(params);

    expect(mailService.sendMail).toHaveBeenCalledWith(
      'test@example.com',
      WalletCashoutTemplate,
      expect.objectContaining({
        amount: '-$300',
        currency: 'USD',
        balanceAfter: '$350',
        occurredAt: expect.any(String),
        txId: 'tx999',
      }),
    );
  });
});
