import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../../src/services/wallet.service';
import { Wallet } from '../../src/entities/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from '../../src/dto/wallet.dto';
import { SupportedCurrencies } from '../../src/enums/currency.enum';
import { Transaction } from '../../src/entities/transaction.entity';
import { NotificationService } from 'src/services/notification.service';
import { UserService } from 'src/services/user.service';
import { WalletCashoutIntent } from 'src/entities/wallet-cashout-intent.entity';
import { PaystackService } from 'src/services/paystack.service';
import { CashoutStatus } from 'src/enums/cashout-status.enum';
import { WalletCashoutDto } from 'src/dto/wallet-cashout.dto';
import { WalletTopUpIntent } from 'src/entities/wallet-topup-intent.entity';
import { TopUpStatus } from 'src/enums/topup-status.enum';

const mockWalletRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

const mockTransactionRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockWalletCashoutIntentRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});
const mockWalletTopUpIntentRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});
const mockPaystackService = () => ({
  createPayout: jest.fn(),
  initializePayment: jest.fn(),
  parseTopUpWebhook: jest.fn(),
  parseCashoutWebhook: jest.fn(),
});

const mockUserService = () => ({
  findById: jest.fn(),
});

const mockNotificationService = () => ({
  sendWalletTopupNotificationEmail: jest.fn(),
  sendWalletCashoutNotificationEmail: jest.fn(),
  sendWalletCashoutFailedNotificationEmail: jest.fn(),
});

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<Repository<Wallet>>;
  let walletCashoutIntentRepository: jest.Mocked<
    Repository<WalletCashoutIntent>
  >;
  let walletTopUpIntentRepository: jest.Mocked<Repository<WalletTopUpIntent>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let dataSource: { query: jest.Mock; transaction: jest.Mock };
  let userService: jest.Mocked<UserService>;
  let notificationService: jest.Mocked<NotificationService>;
  let paystackService: jest.Mocked<PaystackService>;

  beforeEach(async () => {
    const mockDataSource = {
      query: jest.fn(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useFactory: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletCashoutIntent),
          useFactory: mockWalletCashoutIntentRepository,
        },
        {
          provide: getRepositoryToken(WalletTopUpIntent),
          useFactory: mockWalletTopUpIntentRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useFactory: mockTransactionRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: UserService, useFactory: mockUserService },
        { provide: NotificationService, useFactory: mockNotificationService },
        { provide: PaystackService, useFactory: mockPaystackService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get(getRepositoryToken(Wallet));
    walletCashoutIntentRepository = module.get(
      getRepositoryToken(WalletCashoutIntent),
    );
    walletTopUpIntentRepository = module.get(
      getRepositoryToken(WalletTopUpIntent),
    );
    transactionRepository = module.get(getRepositoryToken(Transaction));
    dataSource = module.get(DataSource);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    notificationService = module.get(
      NotificationService,
    ) as jest.Mocked<NotificationService>;
    paystackService = module.get(
      PaystackService,
    ) as jest.Mocked<PaystackService>;
    (service as any).walletCashoutIntentRepository =
      walletCashoutIntentRepository;
  });

  describe('createWallet', () => {
    it('should create and save a new wallet', async () => {
      const dto: CreateWalletDto = { currency: SupportedCurrencies.USD };
      const createdWallet: Wallet = {
        id: '123',
        currency: SupportedCurrencies.USD,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      walletRepository.create.mockReturnValue(createdWallet);
      walletRepository.save.mockResolvedValue(createdWallet);

      const result = await service.createWallet(dto);

      expect(walletRepository.create).toHaveBeenCalledWith({
        currency: SupportedCurrencies.USD,
        isActive: false,
      });

      expect(walletRepository.save).toHaveBeenCalledWith(createdWallet);
      expect(result).toEqual(createdWallet);
    });
  });

  describe('findWalletById', () => {
    it('should return a wallet if found', async () => {
      const wallet = { id: 'abc', currency: 'EUR', isActive: true };
      walletRepository.findOne.mockResolvedValue(wallet as Wallet);

      const result = await service.findWalletById('abc');

      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'abc' },
      });
      expect(result).toEqual(wallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.findWalletById('notfound')).rejects.toThrow(
        NotFoundException,
      );
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notfound' },
      });
    });
  });

  describe('getWalletBalance', () => {
    it('should retrieve the balance of a user', async () => {
      service.findWalletById = jest.fn().mockResolvedValue({
        id: 'wallet-id-abc',
        currency: SupportedCurrencies.NGN,
      });
      dataSource.query = jest.fn().mockResolvedValue([{ balance: '500' }]);
      const balance = await service.getWalletBalance('wallet-id-abc');

      expect(service.findWalletById).toHaveBeenCalledWith('wallet-id-abc');
      expect(dataSource.query).toHaveBeenCalledWith(
        `SELECT * FROM wallet_balances WHERE wallet_id = $1`,
        ['wallet-id-abc'],
      );

      expect(balance).toEqual({
        walletId: 'wallet-id-abc',
        availableBalance: 500,
        currency: SupportedCurrencies.NGN,
      });
    });
  });

  it('should fund the wallet successfully', async () => {
    const wallet = {
      id: 'wallet1',
      currency: SupportedCurrencies.USD,
      isActive: true,
    };
    const user = {
      id: 'user1',
      email: 'user@example.com',
    };
    const amount = 200;

    service.findWalletById = jest.fn().mockResolvedValue(wallet as any);
    userService.findById.mockResolvedValue(user as any);

    const creditTransaction = {
      id: 'tx1',
      walletId: wallet.id,
      amount,
      createdAt: new Date(),
    };
    dataSource.transaction.mockImplementation(async (fn) => {
      return fn({
        getRepository: () => ({
          create: (t) => ({ ...t }),
          save: (t) =>
            Promise.resolve({ ...t, id: 'tx1', createdAt: new Date() }),
        }),
      });
    });

    service.getWalletBalance = jest
      .fn()
      .mockResolvedValue({ availableBalance: 1000 });

    const result = await service.fundWallet(wallet.id, amount, user.id);

    expect(result.id).toBe('tx1');
    expect(service.findWalletById).toHaveBeenCalledWith(wallet.id);
    expect(userService.findById).toHaveBeenCalledWith(user.id);
    expect(
      notificationService.sendWalletTopupNotificationEmail,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userEmail: user.email,
        amount,
        currency: wallet.currency,
        balanceAfter: 1000,
        txId: 'tx1',
      }),
    );
  });

  it('should throw BadRequestException if wallet is inactive', async () => {
    const wallet = {
      id: 'wallet1',
      currency: SupportedCurrencies.USD,
      isActive: false,
    };
    service.findWalletById = jest.fn().mockResolvedValue(wallet as any);

    await expect(service.fundWallet(wallet.id, 100, 'user1')).rejects.toThrow(
      BadRequestException,
    );
  });

  describe('getTopupPaymentLink', () => {
    it('should create a WalletTopUpIntent and return a payment link', async () => {
      const userId = 'user123';
      const amount = 1000;
      const currency = SupportedCurrencies.NGN;
      const email = 'test@example.com';

      const intent = { id: 'intent1', paystackReference: 'ref-123' };
      walletTopUpIntentRepository.create.mockReturnValue(intent as any);
      walletTopUpIntentRepository.save.mockResolvedValue(intent as any);
      paystackService.initializePayment.mockResolvedValue(
        'http://paystack-link',
      );

      const result = await service.getTopupPaymentLink(
        userId,
        amount,
        currency,
        email,
      );

      expect(walletTopUpIntentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId, amount, currency }),
      );
      expect(paystackService.initializePayment).toHaveBeenCalled();
      expect(result).toEqual({ paymentLink: 'http://paystack-link' });
    });
  });

  describe('processTopUpFromWebhook', () => {
    it('should update intent and fund wallet if successful', async () => {
      const reference = 'ref-123';
      const payload = { status: 'success' };
      const user = { id: 'user123', wallets: { NGN: 'wallet123' } };

      paystackService.parseTopUpWebhook.mockResolvedValue({
        isSuccessful: true,
        userId: user.id,
        reference,
        payload: { some: 'mocked_payload' },
        currency: 'NGN',
        amount: 500,
      });
      walletTopUpIntentRepository.findOne.mockResolvedValue({
        id: 'intent1',
        paystackReference: reference,
      } as any);
      walletTopUpIntentRepository.save.mockResolvedValue({} as any);
      userService.findById.mockResolvedValue(user as any);
      service.fundWallet = jest.fn().mockResolvedValue({ id: 'tx1' });

      await service.processTopUpFromWebhook(reference, payload);

      expect(walletTopUpIntentRepository.save).toHaveBeenCalled();
      expect(service.fundWallet).toHaveBeenCalledWith(
        'wallet123',
        500,
        user.id,
      );
    });

    it('should mark intent as failed if webhook unsuccessful', async () => {
      paystackService.parseTopUpWebhook.mockResolvedValue({
        isSuccessful: false,
        reference: 'topup-ref',
        payload: { error: 'Payment failed' },
        userId: 'user123',
        amount: 150,
        currency: 'NGN',
      });
      walletTopUpIntentRepository.findOne.mockResolvedValue({
        id: 'intent1',
        paystackReference: 'ref-123',
      } as any);

      await service.processTopUpFromWebhook('ref-123', {});

      expect(walletTopUpIntentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TopUpStatus.FAILED }),
      );
    });
  });

  describe('initiateCashout', () => {
    it('should create a cashout intent and call paystack payout', async () => {
      const dto: WalletCashoutDto = {
        amount: 500,
        currency: SupportedCurrencies.NGN,
        bankAccountNumber: '1234567890',
        bankCode: '001',
      };
      const user = { id: 'user123', wallets: { NGN: 'wallet123' } };

      userService.findById.mockResolvedValue(user as any);
      service.findWalletById = jest.fn().mockResolvedValue({
        id: 'wallet123',
        currency: SupportedCurrencies.NGN,
      });
      service.getWalletBalance = jest.fn().mockResolvedValue({
        availableBalance: 1000,
        currency: SupportedCurrencies.NGN,
      });

      const intent = { id: 'intent1', status: CashoutStatus.PENDING };
      walletCashoutIntentRepository.create.mockReturnValue(intent as any);
      walletCashoutIntentRepository.save.mockResolvedValue(intent as any);
      paystackService.createPayout.mockResolvedValue({
        data: { reference: 'payout-ref-1' },
      });

      const result = await service.initiateCashout(user.id, dto);

      expect(walletCashoutIntentRepository.save).toHaveBeenCalled();
      expect(paystackService.createPayout).toHaveBeenCalled();
      expect(result.paystackReference).toBe('payout-ref-1');
    });
  });

  describe('processCashoutFromWebhook', () => {
    it('should save debit transaction and send notification if successful', async () => {
      const reference = 'cashout-ref';
      const payload = { data: { status: 'success' } };
      const user = {
        id: 'user123',
        email: 'test@example.com',
        wallets: { NGN: 'wallet123' },
      };

      paystackService.parseCashoutWebhook.mockResolvedValue({
        isSuccessful: true,
        reference,
        payload: { some: 'mocked_payload' },
        userId: user.id,
        amount: 200,
        currency: 'NGN',
      });
      walletCashoutIntentRepository.findOne.mockResolvedValue({
        id: 'intent1',
        paystackReference: reference,
      } as any);
      walletCashoutIntentRepository.save.mockResolvedValue({} as any);
      userService.findById.mockResolvedValue(user as any);
      service.findWalletById = jest
        .fn()
        .mockResolvedValue({ id: 'wallet123', currency: 'NGN' } as any);
      service.getWalletBalance = jest
        .fn()
        .mockResolvedValue({ availableBalance: 800 });

      transactionRepository.create.mockReturnValue({ id: 'tx1' } as any);
      transactionRepository.save.mockResolvedValue({ id: 'tx1' } as any);

      const result = await service.processCashoutFromWebhook(
        reference,
        payload,
      );

      expect(transactionRepository.save).toHaveBeenCalled();
      expect(
        notificationService.sendWalletCashoutNotificationEmail,
      ).toHaveBeenCalled();
      expect(result).toEqual({ id: 'tx1' });
    });

    it('should send failed notification if cashout unsuccessful', async () => {
      paystackService.parseCashoutWebhook.mockResolvedValue({
        isSuccessful: false,
        reference: 'cashout-ref',
        payload: { error: 'Insufficient funds' },
        userId: 'user123',
        amount: 200,
        currency: 'NGN',
      });
      walletCashoutIntentRepository.findOne.mockResolvedValue({
        id: 'intent1',
        paystackReference: 'cashout-ref',
      } as any);
      userService.findById.mockResolvedValue({
        id: 'user123',
        email: 'fail@test.com',
        wallets: { NGN: 'wallet123' },
      } as any);
      service.findWalletById = jest
        .fn()
        .mockResolvedValue({ id: 'wallet123', currency: 'NGN' } as any);
      service.getWalletBalance = jest
        .fn()
        .mockResolvedValue({ availableBalance: 800 });

      await service.processCashoutFromWebhook('cashout-ref', {});

      expect(
        notificationService.sendWalletCashoutFailedNotificationEmail,
      ).toHaveBeenCalled();
    });
  });
});
