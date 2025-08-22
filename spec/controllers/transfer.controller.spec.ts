/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { TransferController } from '../../src/controllers/transfer.controller';
import { TransferService } from '../../src/services/transfer.service';
import { TransferDto } from '../../src/dto/transfer.dto';
import { Transfer } from '../../src/entities/transfer.entity';

describe('TransferController', () => {
  let controller: TransferController;
  let service: jest.Mocked<TransferService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferController],
      providers: [
        {
          provide: TransferService,
          useValue: { transfer: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TransferController>(TransferController);
    service = module.get(TransferService) as jest.Mocked<TransferService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transfer', () => {
    it('should call transferService.transfer and return the result successfully', async () => {
      const dto: TransferDto = {
        sourceWalletId: 'source-id',
        destinationWalletId: 'dest-id',
        amount: 100,
        idempotencyKey: 'abc123',
      };

      const mockTransfer: Transfer = {
        id: 'transfer-id',
        fromWalletId: dto.sourceWalletId,
        toWalletId: dto.destinationWalletId,
        amount: dto.amount,
        currencyCode: 'USD',
        debitTransactionId: 'debit-txn-id',
        creditTransactionId: 'credit-txn-id',
        idempotencyKey: dto.idempotencyKey,
        createdAt: new Date(),
      } as Transfer;

      service.transfer.mockResolvedValue(mockTransfer);

      const result = await controller.transfer(dto);

      expect(service.transfer).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTransfer);
    });

    it('should throw an error if transferService.transfer fails', async () => {
      const dto: TransferDto = {
        sourceWalletId: 'source-id',
        destinationWalletId: 'dest-id',
        amount: 100,
        idempotencyKey: 'abc123',
      };

      service.transfer.mockRejectedValue(new Error('Transfer failed'));

      await expect(controller.transfer(dto)).rejects.toThrow('Transfer failed');
    });
  });
});
