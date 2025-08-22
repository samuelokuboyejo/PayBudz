/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../../src/services/wallet.service';
import { Wallet } from '../../src/entities/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from '../../src/dto/wallet.dto';
import { SupportedCurrencies } from '../../src/enums/currency.enum';
import { Transaction } from '../../src/entities/transaction.entity';

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

const mockDataSource = () => ({
  query: jest.fn(),
});

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<Repository<Wallet>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
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
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get(getRepositoryToken(Wallet));
    transactionRepository = module.get(getRepositoryToken(Transaction));
    dataSource = module.get(DataSource);
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
});
