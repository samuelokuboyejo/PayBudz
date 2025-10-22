import { Test, TestingModule } from '@nestjs/testing';

import { Wallet } from 'src/entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { AdminUserProfileResponse } from 'src/user/dto/admin-user-profile.response';
import { AdminUserController } from 'src/controllers/admin-user.controller';
import { AdminUserService } from 'src/services/admin-user.service';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  let service: AdminUserService;

  const mockAdminUserService = {
    searchUser: jest.fn(),
    deactivateUserWallet: jest.fn(),
    reactivateUserWallet: jest.fn(),
    getTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        { provide: AdminUserService, useValue: mockAdminUserService },
      ],
    }).compile();

    controller = module.get<AdminUserController>(AdminUserController);
    service = module.get<AdminUserService>(AdminUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchUser', () => {
    it('should return user profile', async () => {
      const query = 'John Doe';
      const result: AdminUserProfileResponse = {
        id: '1',
        firstName: 'Sam',
        lastName: 'MAxwell',
        email: 'sammy@example.com',
        isVerified: true,
        username: 'johndoe',
        joinDate: '2025-01-01T00:00:00.000Z',
        lastLogin: '2025-09-01T12:00:00.000Z',
        walletid: 'wallet_123',
        balance: 10000,
        lastTranstactionAt: '2025-09-05T12:00:00.000Z',
        transactionCount: 5,
        transactionValue: 25000,
      };
      mockAdminUserService.searchUser.mockResolvedValue(result);

      expect(await controller.searchUser(query)).toEqual(result);
      expect(mockAdminUserService.searchUser).toHaveBeenCalledWith(query);
    });
  });

  describe('deactivateWallet', () => {
    it('should deactivate wallet', async () => {
      const userId = '1';
      const wallet: Wallet = { id: 'wallet1', isActive: false } as any;
      mockAdminUserService.deactivateUserWallet.mockResolvedValue(wallet);

      expect(await controller.deactivateWallet(userId)).toEqual(wallet);
      expect(mockAdminUserService.deactivateUserWallet).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('activateWallet', () => {
    it('should reactivate wallet', async () => {
      const userId = '1';
      const wallet: Wallet = { id: 'wallet1', isActive: true } as any;
      mockAdminUserService.reactivateUserWallet.mockResolvedValue(wallet);

      expect(await controller.activateWallet(userId)).toEqual(wallet);
      expect(mockAdminUserService.reactivateUserWallet).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('getUserTransactions', () => {
    it('should return list of transactions', async () => {
      const userId = '1';
      const query = { status: 'SUCCESS', type: 'DEBIT' } as any;
      const transactions: Transaction[] = [
        { id: 'tx1', type: 'DEBIT', status: 'SUCCESS' } as any,
        { id: 'tx2', type: 'DEBIT', status: 'SUCCESS' } as any,
      ];

      mockAdminUserService.getTransactions.mockResolvedValue(transactions);

      expect(await controller.getUserTransactions(userId, query)).toEqual(
        transactions,
      );
      expect(mockAdminUserService.getTransactions).toHaveBeenCalledWith({
        userId,
        status: query.status,
        currency: undefined,
        type: query.type,
        fromDate: undefined,
        toDate: undefined,
        sort: 'DESC',
        page: 1,
        limit: 20,
      });
    });
  });
});
