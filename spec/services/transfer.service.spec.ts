import { Test, TestingModule } from '@nestjs/testing';
import { TransferService } from '../../src/services/transfer.service';
import { WalletService } from '../../src/services/wallet.service';
import { NotificationService } from '../../src/services/notification.service';
import { UserService } from '../../src/services/user.service';
import { SlackNotificationService } from '../../src/services/slack-notification.service';
import { Repository, DataSource } from 'typeorm';
import { Transfer } from '../../src/entities/transfer.entity';
import { TransferDto } from 'src/dto/transfer.dto';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { AdminAnalyticsService } from 'src/services/admin-analytics-service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('TransferService', () => {
  let module: TestingModule;
  let service: TransferService;
  let userService: jest.Mocked<UserService>;
  let walletService: jest.Mocked<WalletService>;
  let notificationService: jest.Mocked<NotificationService>;
  let slackService: jest.Mocked<SlackNotificationService>;
  let transferRepo: jest.Mocked<Repository<Transfer>>;
  let dataSource: jest.Mocked<DataSource>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockAdminAnalyticsService = {
      incrementUsers: jest.fn(),
      recordTransaction: jest.fn(),
      updateUserTransactionStats: jest.fn(),
      markWalletActive: jest.fn(),
    };
    const mockTransferRepo = { create: jest.fn(), save: jest.fn() } as any;
    const mockDataSource = {
      transaction: jest
        .fn()
        .mockImplementation(async (cb) =>
          cb({ getRepository: () => mockTransferRepo }),
        ),
    } as any;

    const mockEventEmitter = { emit: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: UserService,
          useValue: { findById: jest.fn(), findByUsername: jest.fn() },
        },
        {
          provide: WalletService,
          useValue: { findWalletById: jest.fn(), getWalletBalance: jest.fn() },
        },
        {
          provide: NotificationService,
          useValue: {
            sendWalletDebitNotificationEmail: jest.fn(),
            sendWalletCreditNotificationEmail: jest.fn(),
          },
        },
        {
          provide: SlackNotificationService,
          useValue: { sendTransactionSuccess: jest.fn() },
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: 'TransferRepository', useValue: mockTransferRepo },
        { provide: AdminAnalyticsService, useValue: mockAdminAnalyticsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get(TransferService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    walletService = module.get(WalletService) as jest.Mocked<WalletService>;
    notificationService = module.get(
      NotificationService,
    ) as jest.Mocked<NotificationService>;
    slackService = module.get(
      SlackNotificationService,
    ) as jest.Mocked<SlackNotificationService>;
    transferRepo = module.get('TransferRepository') as jest.Mocked<
      Repository<Transfer>
    >;
    dataSource = module.get(DataSource) as jest.Mocked<DataSource>;
    eventEmitter = module.get(EventEmitter2) as jest.Mocked<EventEmitter2>;
  });

  afterAll(async () => {
    await module.close();
  });

  it('should perform a transfer successfully', async () => {
    const sourceUser = {
      id: 'user1',
      username: 'sammy@gmail.com',
      email: 'sammy@gmail.com',
      firstName: 'Sam',
      lastName: 'Max',
      dateOfBirth: null,
      isVerified: true,
      authProvider: {},
      firebaseUid: 'firebase-uid-1',
      wallets: { USD: 'wallet1' },
      walletTopUpIntents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const destinationUser = {
      id: 'user2',
      username: 'femi@gmail.com',
      email: 'femi@gmail.com',
      firstName: 'Femi',
      lastName: 'Dom',
      dateOfBirth: null,
      isVerified: true,
      authProvider: {},
      firebaseUid: 'firebase-uid-2',
      wallets: { USD: 'wallet2' },
      walletTopUpIntents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sourceWallet = {
      id: 'wallet1',
      currency: SupportedCurrencies.USD,
      isActive: true,
    };
    const destinationWallet = {
      id: 'wallet2',
      currency: SupportedCurrencies.USD,
      isActive: true,
    };

    const dto: TransferDto = {
      amount: 100,
      currency: SupportedCurrencies.USD,
      destinationUsername: 'jane_doe',
      idempotencyKey: 'key123',
    };

    userService.findById.mockResolvedValue(sourceUser as any);
    userService.findByUsername.mockResolvedValue(destinationUser as any);
    walletService.findWalletById.mockResolvedValueOnce(sourceWallet as any);
    walletService.findWalletById.mockResolvedValueOnce(
      destinationWallet as any,
    );
    walletService.getWalletBalance.mockResolvedValue({
      availableBalance: 500,
    } as any);

    transferRepo.create.mockImplementation(
      (t) =>
        ({
          id: 'transfer1',
          fromWalletId: 'wallet1',
          toWalletId: 'wallet2',
          amount: 100,
          currencyCode: SupportedCurrencies.USD,
          idempotencyKey: 'key123',
          createdAt: new Date(),
          debitTransactionId: 'debit1',
          creditTransactionId: 'credit1',
        } as Transfer),
    );

    transferRepo.save.mockImplementation(async (t) => t as Transfer);

    const result = await service.transfer(sourceUser.id, dto);

    expect(result.id).toBe('transfer1');
    expect(walletService.getWalletBalance).toHaveBeenCalledTimes(1);
    expect(walletService.getWalletBalance).toHaveBeenCalledWith('wallet1');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'transfer.completed',
      expect.objectContaining({
        amount: dto.amount,
        sourceUser,
        destinationUser,
        sourceWallet,
        destinationWallet,
        transfer: expect.any(Object),
      }),
    );
  });
});
