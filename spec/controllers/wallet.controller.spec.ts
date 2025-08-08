import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from 'src/controllers/wallet.controller';
import { WalletService } from 'src/services/wallet.service';
import { CreateWalletDto } from 'src/dto/wallet.dto';
import { NotFoundException } from '@nestjs/common';
import { Wallet } from 'src/entities/wallet.entity';

describe('WalletController', () => {
  let controller: WalletController;
  let service: jest.Mocked<WalletService>;

  beforeEach(async () => {
    const mockWalletService = {
      createWallet: jest.fn(),
      findWalletById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get(WalletService) as jest.Mocked<WalletService>;
  });

  describe('createWallet', () => {
    it('should call walletService.createWallet and return the result', async () => {
      const dto: CreateWalletDto = { currency: 'USD' };
      const createdWallet: Wallet = {
        id: 'wallet-id-123',
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: null
      };

      service.createWallet.mockResolvedValue(createdWallet);

      const result = await controller.createWallet(dto);

      expect(service.createWallet).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdWallet);
    });
  });

  describe('fetchWalletById', () => {
    it('should return the wallet when found', async () => {
      const walletId = 'wallet-id-abc';
      const wallet = { id: walletId, currency: 'NGN', isActive: true };

      service.findWalletById.mockResolvedValue(wallet as Wallet);

      const result = await controller.fetchWalletById(walletId);

      expect(service.findWalletById).toHaveBeenCalledWith(walletId);
      expect(result).toEqual(wallet);
    });

    it('should throw NotFoundException when wallet is not found', async () => {
      const walletId = 'non-existent-id';
      service.findWalletById.mockRejectedValue(new NotFoundException('Wallet not found'));

      await expect(controller.fetchWalletById(walletId)).rejects.toThrow(NotFoundException);
    });
  });
});
