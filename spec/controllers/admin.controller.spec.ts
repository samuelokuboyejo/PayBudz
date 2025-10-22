import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsService } from 'src/services/admin-analytics-service';
import { AdminAnalyticsResponse } from 'src/dto/admin-analytics-response';
import { TransactionVolumeResponse } from 'src/dto/transaction-volume-response';
import { NewUsersResponse } from 'src/dto/new-users-response';
import { UserTransactionStats } from 'src/entities/user-transaction-stats.entity';
import { AdminController } from 'src/controllers/admin.controller';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminAnalyticsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminAnalyticsService,
          useValue: {
            getAnalytics: jest.fn(),
            getTransactionVolumeOverTime: jest.fn(),
            getNewUsersOverTime: jest.fn(),
            getTopUsersByTransactionValue: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get(
      AdminAnalyticsService,
    ) as jest.Mocked<AdminAnalyticsService>;
  });

  describe('getAnalytics', () => {
    it('should return analytics summary', async () => {
      const mockResponse: AdminAnalyticsResponse = {
        totalTransactionValue: 1000,
        totalTransactionCount: 5,
        totalUsers: 20,
        activeWallets: 10,
        revenue: 200,
        lastTransaction: '2025-09-30T10:00:00Z',
      };
      service.getAnalytics.mockResolvedValue(mockResponse);

      const result = await controller.getAnalytics();

      expect(result).toEqual(mockResponse);
      expect(service.getAnalytics).toHaveBeenCalled();
    });
  });

  describe('getTransactionVolume', () => {
    it('should return transaction volume over time', async () => {
      const mockResponse: TransactionVolumeResponse[] = [
        {
          date: '2025-09-30',
          debitTotal: 100,
          creditTotal: 200,
          totalValue: 300,
          count: 2,
        },
      ];
      service.getTransactionVolumeOverTime.mockResolvedValue(mockResponse);

      const result = await controller.getTransactionVolume();

      expect(result).toEqual(mockResponse);
      expect(service.getTransactionVolumeOverTime).toHaveBeenCalled();
    });
  });

  describe('getNewUsers', () => {
    it('should return new users over time', async () => {
      const mockResponse: NewUsersResponse[] = [
        { date: '2025-09-30', userIds: ['u1', 'u2'], count: 2 },
      ];
      service.getNewUsersOverTime.mockResolvedValue(mockResponse);

      const result = await controller.getNewUsers();

      expect(result).toEqual(mockResponse);
      expect(service.getNewUsersOverTime).toHaveBeenCalled();
    });
  });

  describe('getTopUsers', () => {
    it('should return top users by transaction value with default limit', async () => {
      const mockUsers: UserTransactionStats[] = [
        {
          userId: 'u1',
          totalCredit: 100,
          totalDebit: 50,
          totalVolume: 150,
        } as UserTransactionStats,
      ];
      service.getTopUsersByTransactionValue.mockResolvedValue(mockUsers);

      const result = await controller.getTopUsers();

      expect(result).toEqual(mockUsers);
      expect(service.getTopUsersByTransactionValue).toHaveBeenCalledWith(10);
    });

    it('should return top users with custom limit', async () => {
      const mockUsers: UserTransactionStats[] = [
        {
          userId: 'u2',
          totalCredit: 200,
          totalDebit: 100,
          totalVolume: 300,
        } as UserTransactionStats,
      ];
      service.getTopUsersByTransactionValue.mockResolvedValue(mockUsers);

      const result = await controller.getTopUsers(5);

      expect(result).toEqual(mockUsers);
      expect(service.getTopUsersByTransactionValue).toHaveBeenCalledWith(5);
    });
  });
});
