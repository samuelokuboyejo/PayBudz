import { DataSource, Repository } from 'typeorm';
import { TransactionService } from '../../src/services/transaction.service';
import { Transaction } from '../../src/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionStatus } from '../../src/enums/transaction-status.enum';
import { SupportedCurrencies } from '../../src/enums/currency.enum';
import { TransactionType } from '../../src/enums/transaction-type.enum';
import { InvalidTransactionStatusTransitionException } from '../../src/exceptions/invalid.transaction.status.transition.exception';
import { WalletService } from '../../src/services/wallet.service';

const mockTransactionRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockDataSource = () => ({
  query: jest.fn(),
});

const mockManager = {
  create: jest.fn(),
  save: jest.fn(),
  transaction: jest.fn(),
};

const sourceWallet = {
  id: 'source-id',
  currency: 'USD',
  isActive: true,
};

const destinationWallet = {
  id: 'dest-id',
  currency: 'USD',
  isActive: true,
};

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let dataSource: { query: jest.Mock };
  let walletService: jest.Mocked<Partial<WalletService>>;

  beforeEach(async () => {
    walletService = {
      findWalletById: jest.fn(),
      getWalletBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useFactory: mockTransactionRepository,
        },
        { provide: DataSource, useFactory: mockDataSource },
        { provide: WalletService, useValue: walletService },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    dataSource = module.get(DataSource);
  });

  describe('createTransaction', () => {
    it('should create and save a new transaction', async () => {
      const amount = 500;
      const walletId = 'wallet-id-abc';
      const currency = SupportedCurrencies.NGN;
      const transactionType = TransactionType.CREDIT;

      const mockTransaction: Transaction = {
        id: 'transact-id',
        amount,
        walletId,
        currency,
        type: transactionType,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Transaction;

      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(
        amount,
        walletId,
        currency,
        transactionType,
      );

      expect(transactionRepository.create).toHaveBeenCalledWith({
        amount,
        currency,
        walletId,
        type: transactionType,
        status: TransactionStatus.PENDING,
      });

      expect(transactionRepository.save).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findById', () => {
    it('should return a transaction if found', async () => {
      const transaction = {
        id: 'abc',
        walletId: 'wallet-id-123',
        amount: 1000,
        currency: 'EUR',
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESSFUL,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      transactionRepository.findOne.mockResolvedValue(
        transaction as Transaction,
      );

      const result = await service.findById('abc');

      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'abc' },
      });
      expect(result).toEqual(transaction);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      transactionRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('notfound')).rejects.toThrow(
        NotFoundException,
      );
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notfound' },
      });
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update status if transition is valid', async () => {
      const mockTransaction = {
        id: 'transact-id',
        amount: 300,
        walletId: 'wallet-id-abc',
        currency: SupportedCurrencies.NGN,
        type: TransactionType.CREDIT,
        status: TransactionStatus.PENDING,
        updatedAt: new Date(),
      } as Transaction;

      service.findById = jest.fn().mockResolvedValue(mockTransaction);
      const newStatus = TransactionStatus.SUCCESSFUL;
      const tx = { ...mockTransaction, status: TransactionStatus.PENDING };

      (transactionRepository.save as jest.Mock).mockResolvedValue({
        ...tx,
        status: newStatus,
      });

      const result = await service.updateTransactionStatus(tx.id, newStatus);

      expect(service.findById).toHaveBeenCalledWith(mockTransaction.id);
      expect(result.status).toBe(newStatus);
      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: tx.id,
          status: newStatus,
        }),
      );
    });

    it('should throw InvalidTransactionStatusTransitionException if transition is invalid', async () => {
      const mockTransaction = {
        id: 'transact-id',
        amount: 200,
        walletId: 'wallet-id-abc',
        currency: SupportedCurrencies.NGN,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESSFUL,
        updatedAt: new Date(),
      } as Transaction;

      service.findById = jest.fn().mockResolvedValue(mockTransaction);

      await expect(
        service.updateTransactionStatus(
          mockTransaction.id,
          TransactionStatus.PENDING,
        ),
      ).rejects.toThrow(InvalidTransactionStatusTransitionException);
    });
  });
});
