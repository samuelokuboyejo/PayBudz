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
  find: jest.fn(),
  findOne: jest.fn(),
});

const mockDataSource = () => ({
  query: jest.fn(),
});

const mockTransactions = [
  {
    id: '1',
    walletId: 'wallet123',
    amount: 100,
    createdAt: new Date('2025-09-06'),
  },
  {
    id: '2',
    walletId: 'wallet123',
    amount: 50,
    createdAt: new Date('2025-09-07'),
  },
] as Transaction[];

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let dataSource: jest.Mocked<DataSource>;
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
    transactionRepository = module.get(
      getRepositoryToken(Transaction),
    ) as jest.Mocked<Repository<Transaction>>;
    dataSource = module.get(DataSource) as jest.Mocked<DataSource>;
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
      } as Transaction;

      transactionRepository.findOne.mockResolvedValue(transaction);

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

      transactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: newStatus,
      });

      const result = await service.updateTransactionStatus(
        mockTransaction.id,
        newStatus,
      );

      expect(service.findById).toHaveBeenCalledWith(mockTransaction.id);
      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockTransaction.id, status: newStatus }),
      );
      expect(result.status).toBe(newStatus);
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

  it('should return transactions with default parameters', async () => {
    const mockTransactions = [
      { id: '1', amount: 100, walletId: 'wallet1' },
      { id: '2', amount: 50, walletId: 'wallet1' },
    ];

    transactionRepository.find.mockResolvedValue(mockTransactions as any);

    const result = await service.findTransactions('wallet1');

    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: { walletId: 'wallet1' },
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 20,
    });
    expect(result).toEqual(mockTransactions);
  });

  it('should apply status, currency, page, limit, and sort correctly', async () => {
    const mockTransactions = [{ id: '3', amount: 200, walletId: 'wallet2' }];
    transactionRepository.find.mockResolvedValue(mockTransactions as any);

    const result = await service.findTransactions(
      'wallet2',
      'completed',
      'USD',
      'ASC',
      2,
      10,
    );

    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: { walletId: 'wallet2', status: 'completed', currency: 'USD' },
      order: { createdAt: 'ASC' },
      skip: 10,
      take: 10,
    });
    expect(result).toEqual(mockTransactions);
  });
});
