import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransferService } from '../../src/services/transfer.service';
import { WalletService } from '../../src/services/wallet.service';

import { Transfer } from '../../src/entities/transfer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../../src/entities/transaction.entity';

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

describe('TransferService', () => {
  let service: TransferService;
  let walletService: jest.Mocked<WalletService>;
  let dataSource: jest.Mocked<DataSource>;
  let transferRepository: jest.Mocked<Repository<Transfer>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: WalletService,
          useValue: {
            findWalletById: jest.fn(),
            getWalletBalance: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transfer),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
    walletService = module.get(WalletService);
    dataSource = module.get(DataSource);
    transferRepository = module.get(getRepositoryToken(Transfer));
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  describe('findTransferById', () => {
    it('should return a transfer if found', async () => {
      const transfer = {
        id: '123',
        fromWalletId: 'wallet1',
        toWalletId: 'wallet2',
        amount: 1000,
      };
      transferRepository.findOne.mockResolvedValue(transfer as Transfer);

      const result = await service.findTransferById('abc');

      expect(transferRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'abc' },
      });
      expect(result).toEqual(transfer);
    });

    it('should throw NotFoundException if transfer not found', async () => {
      transferRepository.findOne.mockResolvedValue(null);

      await expect(service.findTransferById('notfound')).rejects.toThrow(
        NotFoundException,
      );
      expect(transferRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notfound' },
      });
    });
  });

  describe('findTransfersByWalletId', () => {
    it('should return an array of transfers if found', async () => {
      const transfer = {
        id: '123',
        fromWalletId: 'wallet1',
        toWalletId: 'wallet2',
        amount: 1000,
      } as unknown as Transfer;
      transferRepository.find.mockResolvedValue([transfer]);

      const result = await service.findTransfersByWalletId('wallet1');

      expect(result).toEqual([transfer]);
      expect(transferRepository.find).toHaveBeenCalledWith({
        where: [{ fromWalletId: 'wallet1' }, { toWalletId: 'wallet1' }],
      });
    });

    it('should throw NotFoundException if no transfers found', async () => {
      transferRepository.find.mockResolvedValue([]);

      await expect(service.findTransfersByWalletId('wallet1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transfer', () => {
    it('should throw an error if source wallet is inactive', async () => {
      walletService.findWalletById = jest
        .fn()
        .mockResolvedValueOnce(destinationWallet)
        .mockResolvedValueOnce({ ...sourceWallet, isActive: false });

      await expect(
        service.transfer({
          sourceWalletId: 'wallet-id-abc',
          destinationWalletId: 'wallet-id-123',
          amount: '100',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if destination wallet is inactive', async () => {
      walletService.findWalletById = jest
        .fn()
        .mockResolvedValueOnce({ ...destinationWallet, isActive: false })
        .mockResolvedValueOnce(sourceWallet);

      await expect(
        service.transfer({
          sourceWalletId: 'wallet-id-abc',
          destinationWalletId: 'wallet-id-123',
          amount: '100',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error for insufficient funds', async () => {
      walletService.findWalletById = jest
        .fn()
        .mockResolvedValueOnce(destinationWallet)
        .mockResolvedValueOnce(sourceWallet);

      walletService.getWalletBalance = jest.fn().mockResolvedValue({
        availableBalance: 50,
      });

      await expect(
        service.transfer({
          sourceWalletId: sourceWallet.id,
          destinationWalletId: destinationWallet.id,
          amount: 100,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an errorr if wallets have different currencies', async () => {
      walletService.findWalletById = jest
        .fn()
        .mockResolvedValueOnce({ ...destinationWallet, currency: 'EUR' })
        .mockResolvedValueOnce(sourceWallet);

      walletService.getWalletBalance = jest.fn().mockResolvedValue({
        availableBalance: 1000,
      });

      await expect(
        service.transfer({
          sourceWalletId: sourceWallet.id,
          destinationWalletId: destinationWallet.id,
          amount: '100',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully transfer between wallets', async () => {
      walletService.findWalletById = jest
        .fn()
        .mockResolvedValueOnce(sourceWallet)
        .mockResolvedValueOnce(destinationWallet);

      walletService.getWalletBalance = jest.fn().mockResolvedValue({
        availableBalance: 1000,
      });

      const mockTransactionRepo = {
        create: jest
          .fn()
          .mockReturnValueOnce({ id: 'debit-txn-id' })
          .mockReturnValueOnce({ id: 'credit-txn-id' }),
        save: jest
          .fn()
          .mockResolvedValueOnce({ id: 'debit-txn-id' })
          .mockResolvedValueOnce({ id: 'credit-txn-id' }),
      };

      const mockTransferRepo = {
        create: jest.fn().mockReturnValue({ id: 'transfer-id' }),
        save: jest.fn().mockResolvedValue({ id: 'transfer-id' }),
      };

      jest.spyOn(dataSource, 'transaction').mockImplementation((cb: any) =>
        cb({
          getRepository: (entity: any) => {
            if (entity === Transaction) return mockTransactionRepo;
            if (entity === Transfer) return mockTransferRepo;
          },
        }),
      );

      const result = await service.transfer({
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destinationWallet.id,
        amount: 100,
        idempotencyKey: '1234afvn',
      });

      expect(walletService.findWalletById).toHaveBeenCalledTimes(2);
      expect(walletService.getWalletBalance).toHaveBeenCalledWith(
        sourceWallet.id,
      );
      expect(mockTransactionRepo.create).toHaveBeenCalledTimes(2);
      expect(mockTransactionRepo.save).toHaveBeenCalledTimes(2);
      expect(mockTransferRepo.create).toHaveBeenCalledTimes(1);
      expect(mockTransferRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 'transfer-id' });
    });
  });
});
