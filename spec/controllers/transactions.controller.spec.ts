import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { TransactionController } from 'src/controllers/transactions.controller';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { TransactionService } from 'src/services/transaction.service';
import { Transaction } from 'typeorm';

describe('TransactionsController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            findTransactions: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  it('should call findTransactions with correct params', async () => {
    const mockUser = { wallets: { USD: 'wallet1' } };
    const mockTransactions: Transaction[] = [
      {
        id: 'tx1',
        walletId: 'wallet1',
        createdAt: new Date(),
      } as unknown as Transaction,
    ];

    (service.findTransactions as jest.Mock).mockResolvedValue(mockTransactions);

    const result = await controller.getTransactions(
      { user: mockUser } as any,
      'completed',
      SupportedCurrencies.USD,
      'ASC',
      2,
      5,
    );

    expect(service.findTransactions).toHaveBeenCalledWith(
      'wallet1',
      'completed',
      SupportedCurrencies.USD,
      'ASC',
      2,
      5,
    );
    expect(result).toEqual(mockTransactions);
  });
});
