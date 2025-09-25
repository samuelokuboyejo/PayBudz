import { Test, TestingModule } from '@nestjs/testing';
import { PaystackService } from 'src/services/paystack.service';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { Repository, DataSource } from 'typeorm';
import { WalletService } from 'src/services/wallet.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TopUpStatus } from 'src/enums/topup-status.enum';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import axios from 'axios';

jest.mock('axios');

describe('PaystackService', () => {
  let service: PaystackService;
  let walletTopUpRepo: Repository<WalletTopUpIntent>;
  let walletService: WalletService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaystackService,
        {
          provide: getRepositoryToken(WalletTopUpIntent),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: WalletService,
          useValue: {
            fundWallet: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) =>
              cb({
                findOne: jest.fn(),
                save: jest.fn(),
              }),
            ),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => 'test-value'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue({
              id: 'user-id',
              wallets: { NGN: 'wallet-id' },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaystackService>(PaystackService);
    walletTopUpRepo = module.get<Repository<WalletTopUpIntent>>(
      getRepositoryToken(WalletTopUpIntent),
    );
    walletService = module.get<WalletService>(WalletService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create a topup intent and return payment link', async () => {
    const mockUser: User = {
      id: 'user-id',
      firstName: 'Sam',
      lastName: 'Maxwell',
      username: 'sammy@gmail.com',
      email: 'sammy@gmail.com',
      isVerified: true,
      dateOfBirth: null,
      wallets: { NGN: 'wallet-id' },
      authProvider: {},
      firebaseUid: 'firebase-uid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockIntent = {
      user: mockUser,
      amount: 100,
      currency: SupportedCurrencies.NGN,
      status: TopUpStatus.PENDING,
      paystackReference: 'ref-123',
    };

    jest.spyOn(walletTopUpRepo, 'create').mockReturnValue(mockIntent as any);
    jest.spyOn(walletTopUpRepo, 'save').mockResolvedValue(mockIntent as any);
    (axios.post as jest.Mock).mockResolvedValue({
      data: { data: { authorization_url: 'https://paystack.test' } },
    });

    const result = await service.initiateTopUp(
      mockUser.id,
      100,
      SupportedCurrencies.NGN,
      'sammy@gmail.com',
    );

    expect(result.paymentLink).toBe('https://paystack.test');
    expect(walletTopUpRepo.save).toHaveBeenCalledWith(mockIntent);
  });

  it('should finalize a successful topup', async () => {
    const mockIntent = {
      userId: 'user-id',
      amount: 100,
      status: TopUpStatus.PENDING,
      currency: SupportedCurrencies.NGN,
      user: { id: 'user-id', wallets: { NGN: 'wallet-id' } },
    };

    const mockWebhookPayload = {
      event: 'charge.success',
      data: {
        status: 'success',
        reference: 'ref-123',
      },
    };

    (dataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
      await cb({
        findOne: jest.fn().mockResolvedValue(mockIntent),
        save: jest.fn(),
      });
    });

    await service.finalizeTopUp('ref-123', mockWebhookPayload);
    expect(walletService.fundWallet).toHaveBeenCalledWith(
      'wallet-id',
      100,
      'user-id',
    );
  });
});
