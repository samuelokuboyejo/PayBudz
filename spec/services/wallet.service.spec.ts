import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { Wallet } from '../entities/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from '../dto/wallet.dto';

// Create mock repository
const mockWalletRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockDataSource = () => ({
  // add mocks for transactional logic if needed
});

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<Repository<Wallet>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useFactory: mockWalletRepository },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get(getRepositoryToken(Wallet));
  });

  describe('createWallet', () => {
    it('should create and save a new wallet', async () => {
      const dto: CreateWalletDto = { currency: 'USD' };
      const createdWallet: Wallet = { id: '123', currency: 'USD', isActive: true };

      walletRepository.create.mockReturnValue(createdWallet);
      walletRepository.save.mockResolvedValue(createdWallet);

      const result = await service.createWallet(dto);

      expect(walletRepository.create).toHaveBeenCalledWith({
        currency: 'USD',
        isActive: true,
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

      expect(walletRepository.findOne).toHaveBeenCalledWith({ where: { id: 'abc' } });
      expect(result).toEqual(wallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.findWalletById('notfound')).rejects.toThrow(NotFoundException);
      expect(walletRepository.findOne).toHaveBeenCalledWith({ where: { id: 'notfound' } });
    });
  });
});
