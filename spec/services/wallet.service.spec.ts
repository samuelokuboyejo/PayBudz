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

const mockWalletRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockTransactionRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<Repository<Wallet>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let dataSource: { query: jest.Mock; transaction: jest.Mock };
  let userService: jest.Mocked<UserService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockUserService = () => ({
    findById: jest.fn(),
  });

  const mockNotificationService = () => ({
    sendWalletTopupNotificationEmail: jest.fn(),
  });

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
          provide: getRepositoryToken(Transaction),
          useFactory: mockTransactionRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: UserService, useFactory: mockUserService },
        { provide: NotificationService, useFactory: mockNotificationService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get(getRepositoryToken(Wallet));
    transactionRepository = module.get(getRepositoryToken(Transaction));
    dataSource = module.get(DataSource);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    notificationService = module.get(
      NotificationService,
    ) as jest.Mocked<NotificationService>;
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
});
