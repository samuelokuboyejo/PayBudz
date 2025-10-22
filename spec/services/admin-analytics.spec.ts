import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsService } from 'src/services/admin-analytics-service';
import { Repository, EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminAnalytics } from 'src/entities/admin-analytics.entity';
import { UserTransactionStats } from 'src/entities/user-transaction-stats.entity';
import { UserSignupEvent } from 'src/entities/user-sign-up-event.entity';
import { TransactionEvent } from 'src/entities/transaction-event.entity';
import { TransactionType } from 'src/enums/transaction-type.enum';

describe('AdminAnalyticsService', () => {
  let service: AdminAnalyticsService;
  let analyticsRepo: jest.Mocked<Repository<AdminAnalytics>>;
  let statsRepo: jest.Mocked<Repository<UserTransactionStats>>;
  let signupRepo: jest.Mocked<Repository<UserSignupEvent>>;
  let eventRepo: jest.Mocked<Repository<TransactionEvent>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAnalyticsService,
        {
          provide: getRepositoryToken(AdminAnalytics),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(UserTransactionStats),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(UserSignupEvent),
          useValue: createMockRepo(),
        },
        {
          provide: getRepositoryToken(TransactionEvent),
          useValue: createMockRepo(),
        },
      ],
    }).compile();

    service = module.get(AdminAnalyticsService);
    analyticsRepo = module.get(getRepositoryToken(AdminAnalytics));
    statsRepo = module.get(getRepositoryToken(UserTransactionStats));
    signupRepo = module.get(getRepositoryToken(UserSignupEvent));
    eventRepo = module.get(getRepositoryToken(TransactionEvent));
  });

  function createMockRepo() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
  }

  describe('getSnapshot', () => {
    it('should return existing snapshot', async () => {
      const snapshot = { id: 1, totalUsers: 5 } as unknown as AdminAnalytics;
      analyticsRepo.findOneBy.mockResolvedValue(snapshot);

      const result = await (service as any).getSnapshot();

      expect(result).toEqual(snapshot);
    });

    it('should create snapshot if not found', async () => {
      const newSnapshot = { id: 2 } as unknown as AdminAnalytics;
      analyticsRepo.findOneBy.mockResolvedValue(null);
      analyticsRepo.create.mockReturnValue(newSnapshot);
      analyticsRepo.save.mockResolvedValue(newSnapshot);

      const result = await (service as any).getSnapshot();

      expect(result).toEqual(newSnapshot);
      expect(analyticsRepo.create).toHaveBeenCalled();
      expect(analyticsRepo.save).toHaveBeenCalledWith(newSnapshot);
    });
  });

  describe('incrementUsers', () => {
    it('should increment totalUsers and save', async () => {
      const manager = {
        getRepository: () => analyticsRepo,
      } as unknown as EntityManager;
      const snapshot = { totalUsers: 1 } as AdminAnalytics;
      analyticsRepo.findOneBy.mockResolvedValue(snapshot);
      analyticsRepo.save.mockResolvedValue(snapshot);

      await service.incrementUsers(manager);

      expect(snapshot.totalUsers).toBe(2);
      expect(analyticsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ totalUsers: 2 }),
      );
    });
  });

  describe('getAnalytics', () => {
    it('should format snapshot into AdminAnalyticsResponse', async () => {
      const snapshot = {
        totalTransactionValue: 1000,
        totalTransactionCount: 5,
        totalUsers: 3,
        activeWallets: 2,
        revenue: 500,
        lastTransaction: new Date('2025-10-01T10:00:00Z'),
      } as AdminAnalytics;

      analyticsRepo.findOneBy.mockResolvedValue(snapshot);

      const result = await service.getAnalytics();

      expect(result).toEqual(
        expect.objectContaining({
          totalTransactionValue: 10,
          totalTransactionCount: 5,
          totalUsers: 3,
          activeWallets: 2,
          revenue: 5,
          lastTransaction: expect.any(String),
        }),
      );
    });
  });

  describe('getNewUsersOverTime', () => {
    it('should group new users by date', async () => {
      const events = [
        { createdAt: new Date('2025-10-01T12:00:00Z'), userId: 'u1' },
        { createdAt: new Date('2025-10-01T15:00:00Z'), userId: 'u2' },
        { createdAt: new Date('2025-10-02T10:00:00Z'), userId: 'u3' },
      ] as UserSignupEvent[];

      signupRepo.find.mockResolvedValue(events);

      const result = await service.getNewUsersOverTime();

      expect(result).toEqual([
        { date: '2025-10-01', userIds: ['u1', 'u2'], count: 2 },
        { date: '2025-10-02', userIds: ['u3'], count: 1 },
      ]);
    });
  });

  describe('getTransactionVolumeOverTime', () => {
    it('should calculate daily transaction totals correctly', async () => {
      const events = [
        {
          createdAt: new Date('2025-10-01T10:00:00Z'),
          amount: 5000,
          type: TransactionType.DEBIT,
        },
        {
          createdAt: new Date('2025-10-01T12:00:00Z'),
          amount: 3000,
          type: TransactionType.CREDIT,
        },
        {
          createdAt: new Date('2025-10-02T09:00:00Z'),
          amount: 7000,
          type: TransactionType.DEBIT,
        },
      ] as unknown as TransactionEvent[];

      eventRepo.find.mockResolvedValue(events);

      const result = await service.getTransactionVolumeOverTime();

      expect(result).toEqual([
        {
          date: '2025-10-01',
          debitTotal: 50,
          creditTotal: 30,
          totalValue: 80,
          count: 2,
        },
        {
          date: '2025-10-02',
          debitTotal: 70,
          creditTotal: 0,
          totalValue: 70,
          count: 1,
        },
      ]);
    });
  });
});
