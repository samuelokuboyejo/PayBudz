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
            getUserTransactionHistory: jest.fn(),
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

  it('should call getUserTransactionHistory with correct params', async () => {
    const mockUser = { wallets: { USD: 'wallet1' } };
    const mockTransactions: any[] = [
      {
        id: 'tx1',
        walletId: 'wallet1',
        amount: 500,
        currency: 'USD',
        type: 'CREDIT',
        status: 'SUCCESSFUL',
        createdAt: new Date(),
        sourceWalletId: 'wallet1',
        destinationWalletId: null,
      },
    ];

    (service.getUserTransactionHistory as jest.Mock).mockResolvedValue(
      mockTransactions,
    );

    const result = await controller.getTransactions(
      { user: mockUser } as any,
      'SUCCESSFUL',
      SupportedCurrencies.USD,
      'ASC',
      1,
      10,
    );

    expect(service.getUserTransactionHistory).toHaveBeenCalledWith(
      mockUser,
      'SUCCESSFUL',
      SupportedCurrencies.USD,
      'ASC',
      1,
      10,
    );
    expect(result).toEqual(mockTransactions);
  });
});
