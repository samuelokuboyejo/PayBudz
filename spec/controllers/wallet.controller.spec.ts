/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from '../../src/controllers/wallet.controller';
import { WalletService } from '../../src/services/wallet.service';
import { CreateWalletDto } from '../../src/dto/wallet.dto';
import { WalletBalanceDto } from '../../src/dto/wallet-balance.dto';
import {
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Wallet } from '../../src/entities/wallet.entity';
import { SupportedCurrencies } from '../../src/enums/currency.enum';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { PaystackService } from 'src/services/paystack.service';
import { TopUpDto } from 'src/dto/topup.dto';

class MockFirebaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

describe('WalletController', () => {
  let controller: WalletController;
  let service: jest.Mocked<WalletService>;
  let paystackService: jest.Mocked<PaystackService>;

  beforeEach(async () => {
    const mockWalletService = {
      createWallet: jest.fn(),
      findWalletById: jest.fn(),
      getWalletBalance: jest.fn(),
      activateWallet: jest.fn(),
      deactivateWallet: jest.fn(),
    };

    const mockPaystackService = {
      initiateTopUp: jest.fn(),
      handlePaystackWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        { provide: PaystackService, useValue: mockPaystackService },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useClass(MockFirebaseAuthGuard)
      .compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get(WalletService) as jest.Mocked<WalletService>;
    paystackService = module.get(
      PaystackService,
    ) as jest.Mocked<PaystackService>;
  });

  describe('createWallet', () => {
    it('should call walletService.createWallet and return the result', async () => {
      const dto: CreateWalletDto = { currency: SupportedCurrencies.USD };
      const createdWallet: Wallet = {
        id: 'wallet-id-123',
        currency: SupportedCurrencies.USD,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
      const wallet = {
        id: walletId,
        currency: SupportedCurrencies.NGN,
        isActive: true,
      };

      service.findWalletById.mockResolvedValue(wallet as Wallet);

      const result = await controller.fetchWalletById(walletId);

      expect(service.findWalletById).toHaveBeenCalledWith(walletId);
      expect(result).toEqual(wallet);
    });

    it('should throw NotFoundException when wallet is not found', async () => {
      const walletId = 'non-existent-id';
      service.findWalletById.mockRejectedValue(
        new NotFoundException('Wallet not found'),
      );

      await expect(controller.fetchWalletById(walletId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWalletBalance', () => {
    it('should retrieve the wallet balance of a user', async () => {
      const mockResponse: WalletBalanceDto = {
        walletId: 'wallet-id-abc',
        availableBalance: 500,
        currency: SupportedCurrencies.NGN,
      };

      service.getWalletBalance.mockResolvedValue(mockResponse);

      const result = await controller.getWalletBalance('wallet-id-abc');

      expect(result).toEqual(mockResponse);
      expect(service.getWalletBalance).toHaveBeenCalledWith('wallet-id-abc');
    });
  });

  describe('initiateTopUp', () => {
    it('should call paystackService.initiateTopUp and return the result', async () => {
      const dto: TopUpDto = {
        amount: 1000,
        currency: SupportedCurrencies.NGN,
        email: 'user@test.com',
      };
      const mockUser = { id: 'user-id-123', email: 'user@test.com' };
      const mockResponse = { paymentLink: 'https://paystack.com/pay/123' };

      paystackService.initiateTopUp.mockResolvedValue(mockResponse);

      const req = { user: mockUser } as any;

      const result = await controller.initiateTopUp(req, dto);

      expect(paystackService.initiateTopUp).toHaveBeenCalledWith(
        mockUser,
        dto.amount,
        dto.currency,
        dto.email,
      );
      expect(result).toEqual(mockResponse);
    });
  });


});
