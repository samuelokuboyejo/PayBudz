/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { TransferController } from '../../src/controllers/transfer.controller';
import { TransferService } from '../../src/services/transfer.service';
import { TransferDto } from '../../src/dto/transfer.dto';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { SupportedCurrencies } from 'src/enums/currency.enum';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { UserService } from 'src/services/user.service';

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
        {
          provide: UserService,
          useValue: { findById: jest.fn(), findByUsername: jest.fn() },
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<TransferController>(TransferController);
    service = module.get(TransferService) as jest.Mocked<TransferService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transfer', () => {
    it('should call transferService.transfer and return the result successfully', async () => {
      const mockDto: TransferDto = {
        destinationUsername: 'john_doe',
        amount: 500,
        idempotencyKey: 'abc123',
        currency: SupportedCurrencies.USD,
      };

      const mockReq = { user: { id: 'source-user-id' } };

      const mockResult = { id: 'transfer-id' };
      (service.transfer as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.transfer(mockDto, mockReq);

      expect(service.transfer).toHaveBeenCalledWith('source-user-id', mockDto);
      expect(result).toBe(mockResult);
    });

    it('should throw an error if transferService.transfer throws', async () => {
      const mockDto: TransferDto = {
        destinationUsername: 'john_doe',
        amount: 500,
        idempotencyKey: 'abc123',
        currency: SupportedCurrencies.USD,
      };
      const mockReq = { user: { uid: 'source-user-id' } };

      (service.transfer as jest.Mock).mockRejectedValue(
        new BadRequestException('Insufficient funds'),
      );

      await expect(controller.transfer(mockDto, mockReq)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
